help:
	@echo "Usage :\n\
	make clean|prod|dev\n"
	@echo "make clean		clean public and build folders"
	@echo "make prod		build for production env"
	@echo "make dev		serve for dev env"
clean:
	rm -Rf build/*

prod:clean
	npm run build

dev:clean
	npm run dev
	@echo "Happy coding!"
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

check-prod-link: ## 🔍 Check for production links and sources
	@echo "🔍 Checking production link : "



push: check-prod-link ## ⬆️ Push content to Gandi
	@echo "⬆️ Pushing content to Gandi"
	rsync -avz --no-owner --no-group ./build/* ./production/play/ \
	&& echo "Pushed to Gandi" \
	|| echo "Failed to push to Gandi"


.PHONY: help clean prod dev deployToSFTP
.DEFAULT_GOAL := help