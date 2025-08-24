# Colors for better output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

help:
	@echo "Usage :"
	@echo "  make clean|prod|dev|bump|search"
	@echo ""
	@echo "make clean			clean public and build folders"
	@echo "make prod			build for production env"
	@echo "make dev				serve for dev env"
	@echo "make test			run tests"
	@echo "make bump			update version in package.json based on git revision"
	@echo "make search GREP_ME	search for GREP_ME in ./src/ directory (grep -rin)"
	@echo "make mount			mount Gandi to ./production"
	@echo "make umount			unmount Gandi from ./production"
	@echo "make ingest			ingest content from git to build folder"
	@echo "make push			push content to Gandi (after checking)"

clean:
	@echo "$(YELLOW)🧹 Cleaning build directory...$(NC)"
	rm -Rf build/*
	@echo "$(GREEN)✓ Clean completed$(NC)"

prod: clean
	@echo "$(YELLOW)🏗️  Building for production...$(NC)"
	npm run build
	@echo "$(GREEN)✓ Production build completed$(NC)"

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

# Search feature - the main addition you requested
search:
ifndef GREP_ME
	@echo "$(RED)❌ Error: Please specify a search term$(NC)"
	@echo "Usage: make search GREP_ME=your_search_term"
	@exit 1
else
	@echo "$(YELLOW)🔍 Searching for '$(GREP_ME)' in ./src/...$(NC)"
	@grep --color=auto -rin "$(GREP_ME)" ./src/ || echo "$(YELLOW)No results found for '$(GREP_ME)'$(NC)"
endif

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
	gitingest ./src/
	@echo "$(GREEN)✓ Content ingested$(NC)"

check-prod-link:
	@echo "$(YELLOW)🔍 Checking production link...$(NC)"
	@grep "Fantasy Chess" ./production/play/index.html \
		&& echo "$(GREEN)✓ OK - Valid production sources$(NC)" \
		|| echo "$(RED)❌ Not a valid production sources$(NC)"

push: check-prod-link
	@echo "$(YELLOW)⬆️ Pushing content to Gandi...$(NC)"
	rsync -avz --no-owner --no-group ./build/* ./production/play/ \
		&& echo "$(GREEN)✓ Pushed to Gandi$(NC)" \
		|| echo "$(RED)❌ Failed to push to Gandi$(NC)"

.PHONY: help clean prod dev test bump search mount umount ingest check-prod-link push
.DEFAULT_GOAL := help