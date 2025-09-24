# Colors for better output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

help:
	@echo "Usage :"
	@echo "  make clean|prod|dev|bump|search|mount|umount|ingest|ingest-light|php-serve|push"
	@echo ""
	@echo "make clean			clean public and build folders"
	@echo "make prod			build for production env"
	@echo "make push			push content to Gandi (after checking)"
	@echo "make dev				serve for dev env"
	@echo "make sync-github		sync main branch to GitHub repository"
	@echo "make type-check		run TypeScript type check"
	@echo "make test			run tests"
	@echo "make bump			update version in package.json based on git revision"
	@echo "make search GREP_ME	search for GREP_ME in ./src/ directory (grep -rin)"
	@echo "                     (e.g., make search GREP_ME=Chess)"
	@echo "make mount			mount Gandi to ./production"
	@echo "make umount			unmount Gandi from ./production"
	@echo "make ingest			ingest content from git to build folder"
	@echo "make ingest-light	ingest content from git to build folder without assets"
	@echo "make php-serve		serve PHP backend for production preview"


clean:
	@echo "$(YELLOW)🧹 Cleaning build directory...$(NC)"
	rm -Rf build/*
	@echo "$(GREEN)✓ Clean completed$(NC)"
prod: clean
	@echo "$(YELLOW)🏗️  Building for production...$(NC)"
	npm run build
	@echo "$(YELLOW)📂 Copying PHP API files...$(NC)"
	cp -r src/backend/api build/api
	@echo "$(GREEN)✓ Production build completed with PHP API$(NC)"
dev:
	@echo "$(YELLOW)🚀 Starting development server...$(NC)"
	npm run start
	@echo "$(GREEN)Happy coding!$(NC)"
test:
	@echo "$(YELLOW)🧪 Running tests...$(NC)"
	npm run test
bump:
	@echo "$(YELLOW)🔄 Bumping version...$(NC)"
	@git rev-list --count HEAD > .revision
	@REVISION=$$(cat .revision); \
	VERSION=$$(node -p "require('./package.json').version"); \
	MAJOR_MINOR=$$(echo $$VERSION | cut -d. -f1-2); \
	NEW_VERSION="$$MAJOR_MINOR.$$REVISION"; \
	npm --no-git-tag-version version $$NEW_VERSION > /dev/null; \
	echo "$(GREEN)✓ Version updated to $$NEW_VERSION$(NC)"
search:
ifndef GREP_ME
	@echo "$(RED)❌ Error: Please specify a search term$(NC)"
	@echo "Usage: make search GREP_ME=your_search_term"
	@exit 1
else
	@echo "$(YELLOW)🔍 Searching for '$(GREP_ME)' in ./src/...$(NC)"
	@grep --color=auto -rin "$(GREP_ME)" ./src/ || echo "$(YELLOW)No results found for '$(GREP_ME)'$(NC)"
endif
backend-deps:
	@echo "$(YELLOW)📦 Installing backend dependencies...$(NC)"
	@cd src/backend && composer install
	@echo "$(GREEN)✓ Backend dependencies installed$(NC)"
php-serve-start: backend-deps
	@echo "$(YELLOW)🚀 Starting PHP server for production preview...$(NC)"
	@cd ./src/backend && php -S localhost:4242 -t api/ >> ../../logs/php.log 2>&1 &
	@sleep 1
	@echo "$(GREEN)✓ PHP server started at http://localhost:4242$(NC)"
	@echo "$(YELLOW)You can stop it by running 'make php-serve-stop'$(NC)"
	@echo "$(YELLOW)Logs are being written to logs/php.log$(NC)"
	@echo "$(GREEN)Happy testing$(NC)"
php-serve-stop: ./src/backend/serve.pid
	@echo "$(YELLOW)🛑 Stopping PHP server...$(NC)"
	@pkill -e -f "php -S localhost:4242" 2>&1 || echo "$(YELLOW)⚠️  No PHP server running$(NC)"
	@rm ./src/backend/serve.pid
	@echo "$(GREEN)✓ PHP server stopped$(NC)"
php-serve: php-serve-stop php-serve-start
mount:
	@echo "$(YELLOW)⛰️ Mounting Gandi to ./production...$(NC)"
	@mkdir ./production || (echo "$(YELLOW)./production already exists$(NC)" ; exit 1)
	
	@if [ -z "${G_LOGIN}" ] || [ -z "${G_HOST}" ] || [ -z "${G_PASSWD}" ]; then \
		echo "$(RED)❌ Please set G_LOGIN, G_HOST, and G_PASSWD environment variables$(NC)"; \
		exit 1; \
	fi
	@echo ${G_PASSWD} | sshfs ${G_LOGIN}@${G_HOST}:/vhosts/fantasy-chess.prigent.site/htdocs/ \
	./production -o password_stdin && \
	echo "$(GREEN)✓ Gandi mounted to ./production$(NC)" || \
	echo "$(RED)❌ Failed to mount Gandi$(NC)"
umount:
	@echo "$(YELLOW)⬇️ Unmounting Gandi...$(NC)"
	umount ./production && echo "$(GREEN)✓ Gandi unmounted$(NC)" || echo "$(YELLOW)⚠️  Failed to unmount Gandi (maybe already unmounted?)$(NC)"
	@rmdir ./production 2>/dev/null || true
ingest:
	@echo "$(YELLOW)📥 Ingesting content...$(NC)"
	gitingest . -e build -e production -e node_modules -e .git -e .vscode \
	-e logs -e src/.env -e src/backend/vendor -e src/assets/themes -e public/assets \
	-e README.md -e LICENCE.md -e CHANGELOG -e TODO.md 
	@echo "$(GREEN)✓ Content ingested$(NC)"
	@ls -lh digest.txt
ingest-light:
	@echo "$(YELLOW)📥 Ingesting content without assets...$(NC)"
	gitingest ./src/ -e assets
	@echo "$(GREEN)✓ Content ingested$(NC)"
	ls -lh digest.txt
check-prod-link:
	@echo "$(YELLOW)🔍 Checking production link...$(NC)"
	@grep "Fantasy Chess" ./production/play/index.html \
		&& echo "$(GREEN)✓ OK - Valid production sources$(NC)" \
		|| echo "$(RED)❌ Not a valid production sources$(NC)"
push: check-prod-link
	@echo "$(YELLOW)⬆️ Pushing content : $(NC)"
	@du -hs ./build
	@echo "$(YELLOW) to Gandi ...$(NC)"
	@time rsync -avz --no-owner --no-group ./build/* ./production/play/ \
		&& echo "$(GREEN)✓ Pushed to Gandi$(NC)" \
		|| echo "$(RED)❌ Failed to push to Gandi$(NC)"
sync-github:
	@echo "$(YELLOW)🔄 Syncing GitHub repository...$(NC)"
	@ git push github main:main-github
	@echo "$(GREEN)✓ GitHub repository synced$(NC)"
type-check:
	@echo "$(YELLOW)🔍 Running TypeScript type check...$(NC)"
	@npm run type-check > ./logs/tsc.log 2>&1 \
	&& echo "$(GREEN)✓ Type check passed$(NC)" \
	|| (echo "$(RED)❌ Type check failed. details saved in logs/tsc.log$(NC)")
	@cat ./logs/tsc.log

.PHONY: help clean prod dev test bump search mount umount ingest check-prod-link push
.DEFAULT_GOAL := help