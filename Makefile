
test-index:
	curl --silent http://localhost:3000/

test-ok: test-ok-chilts test-ok-scripting test-ok-freecodecamp

test-ok-chilts-rss:
	curl --silent http://localhost:3000/convert?url=http://chilts.org/rss.xml | json_pp
	echo

test-ok-scripting-rss:
	curl --silent http://localhost:3000/convert?url=http://scripting.com/rss.xml | json_pp
	echo

test-ok-freecodecamp-rss:
	curl --silent http://localhost:3000/convert?url=https://medium.freecodecamp.com/feed | json_pp
	echo

test-ok-intertwingly-atom:
	curl --silent http://localhost:3000/convert?url=http://www.intertwingly.net/blog/index.atom | json_pp

test-invalid-feed:
	curl --silent http://localhost:3000/convert?url=https://google.com/ | json_pp
	echo

test-not-found:
	curl --silent http://localhost:3000/convert?url=http://chilts.org/feed.xml | json_pp

test-invalid-url:
	curl --silent http://localhost:3000/convert?url=ftp://example.com/atom.xml | json_pp

test-empty-url:
	curl --silent http://localhost:3000/convert?url= | json_pp

test-blank-url:
	curl --silent http://localhost:3000/convert?url | json_pp

test-no-url:
	curl --silent http://localhost:3000/convert | json_pp
