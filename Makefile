.PHONY: build test lint release

build:
	npm run build

test:
	npm test -- --runInBand

lint:
	npm run lint

release:
	./scripts/release.sh
