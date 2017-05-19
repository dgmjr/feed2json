
test-ok: test-ok-chilts test-ok-scripting test-ok-freecodecamp

test-ok-chilts:
	curl --silent http://localhost:3000/?url=http://chilts.org/rss.xml | json_pp
	echo

test-ok-scripting:
	curl --silent http://localhost:3000/?url=http://scripting.com/rss.xml | json_pp
	echo

test-ok-freecodecamp:
	curl --silent http://localhost:3000/?url=https://medium.freecodecamp.com/feed | json_pp
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
