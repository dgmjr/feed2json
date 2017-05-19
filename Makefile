
test: test-chilts test-scripting

test-chilts:
	curl --silent http://localhost:3000/?url=http://chilts.org/rss.xml | json_pp
	echo

test-scripting:
	curl --silent http://localhost:3000/?url=http://scripting.com/rss.xml | json_pp
	echo

test-not-found:
	curl --silent http://localhost:3000/?url=http://chilts.org/feed.xml | json_pp

test-invalid-url:
	curl --silent http://localhost:3000/?url=ftp://example.com/atom.xml | json_pp

test-empty-url:
	curl --silent http://localhost:3000/?url= | json_pp

test-blank-url:
	curl --silent http://localhost:3000/?url | json_pp

test-no-url:
	curl --silent http://localhost:3000/ | json_pp
