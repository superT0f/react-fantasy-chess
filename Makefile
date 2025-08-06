help:
	@echo "Usage :\n\
	make clean|prod|dev|bump\n"
	@echo "make clean		clean public and build folders"
	@echo "make prod		build for production env"
	@echo "make dev		serve for dev env"
	@echo "make bump		update version in package.json based on git revision"

clean:
	rm -Rf build/*

prod:clean
	npm run build

dev:clean
	npm run start
	@echo "Happy coding!"

bump:
	@echo "Bumping version..."
	@git rev-list --count HEAD > .revision
	@REVISION=$$(cat .revision); \
	VERSION=$$(node -p "require('./package.json').version"); \
	MAJOR_MINOR=$$(echo $$VERSION | cut -d. -f1-2); \
	NEW_VERSION="$$MAJOR_MINOR.$$REVISION"; \
	npm --no-git-tag-version version $$NEW_VERSION > /dev/null; \
	echo "Version updated to $$NEW_VERSION"


mount: ## ⛰️ Mount Gandi to ./production
	@echo "⛰️ Mounting Gandi to ./production"
	@mkdir ./production || (echo "./production already mounted" ; exit 1)

	@if [ -z "${G_LOGIN}" ] || [ -z "${G_HOST}" ] || [ -z "${G_PASSWD}" ]; then \
		echo "Please set G_LOGIN, G_HOST, and G_PASSWD environment variables"; \
		exit 1; \
	fi
	@echo ${G_PASSWD} | sshfs ${G_LOGIN}@${G_HOST}:/vhosts/fantasy-chess.prigent.site/htdocs/ \
	./production -o password_stdin 		&& \
	echo "Gandi mounted to ./production"  || \
	echo "Failed to mount Gandi"

umount: ## ⬇️ Unmount Gandi
	@echo "⬇️ Unmounting Gandi"
	umount ./production && echo "Gandi unmounted" || echo "Failed to unmount Gandi"
	rmdir ./production

ingest: ## 📥 Ingest content
	@echo "📥 Ingesting content"
	gitingest . -e build/ -e node_modules/ -e production/ -e LICENCE.md

check-prod-link: ## 🔍 Check for production links and sources
	@echo "🔍 Checking production link : "
	@grep "Fantasy Chess" ./production/play/index.html \
		&& echo "OK" \
		|| echo "Not a valid production sources"

push: check-prod-link ## ⬆️ Push content to Gandi
	@echo "⬆️ Pushing content to Gandi"
	rsync -avz --no-owner --no-group ./build/* ./production/play/ \
		&& echo "Pushed to Gandi" \
		|| echo "Failed to push to Gandi"

.PHONY: help clean prod dev deployToSFTP bump
.DEFAULT_GOAL := help