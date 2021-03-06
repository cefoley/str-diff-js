// Tests

function runTests() {
	let results = [
		assertMatrix([[0]], "", ""),
		assertMatrix([[0,1]], "", "a"),
		assertMatrix([[0],[1]], "a", ""),
		assertMatrix([[0,1],[1,0]], "a", "a"),
		assertMatrix([[0,1],[1,1]], "a", "b"),
		assertMatrix([[0,1,2],[1,0,1],[2,1,0]], "ab", "ab"),
		assertMatrix([[0,1,2],[1,0,1],[2,1,1]], "ab", "ac"),
		assertMatrix([[0,1,2],[1,1,2],[2,2,1]], "ab", "xb"),
		assertMatrix([[0,1,2],[1,1,2],[2,2,2]], "ab", "xy"),
		assertMatrix([[0,1],[1, 0],[2,1]], "ab", "a"),
		assertMatrix([[0,1,2],[1,0,1]], "a", "ab"),
		assertStringsEqual(true, "", ""),
		assertStringsEqual(true, "a", "a"),
		assertStringsEqual(true, "ab", "ab"),
		assertStringsEqual(false, "a", ""),
		assertStringsEqual(false, "", "a"),
		assertStringsEqual(false, "ab", "ax"),
		assertEditStringA("", "", ""),
		assertEditStringA("-", "a", ""),
		assertEditStringA("--", "ab", ""),
		assertEditStringA("+", "", "a"),
		assertEditStringA("++", "", "ab"),
		assertEditStringA("----===", "abcdxyz", "xyz"),
		assertEditStringA("++++===", "xyz", "abcdxyz"),
		assertEditStringA("----===-", "abcdxyzh", "xyz"),
		assertEditStringA("----=-==-", "abcdxpyzh", "xyz"),
		assertEditStringA("++++=+==+", "xyz", "abcdxpyzh"),
		assertEditStringA("-+", "a", "b"),
		assertEditStringA("-+==", "Axy", "Bxy"),
		assertEditStringA("=-+=", "xAy", "xBy"),
		assertEditStringA("==+", "aa", "aab"),
		assertInDel("", "", ""),
		assertInDel("={a}", "a", "a"),
		assertInDel("={abc}", "abc", "abc"),
		assertInDel("-{abc}", "abc", ""),
		assertInDel("+{abc}", "", "abc"),
		assertInDel("-{abc}+{xyz}", "abc", "xyz"),
		assertInDel("-{ab}+{x}={123}-{c}+{yz}", "ab123c", "x123yz"),
		assertHtml('', "", ""),
		assertHtml('<span class="same">a</span>', "a", "a"),
		assertHtml('<span class="same">abc</span>', "abc", "abc"),
		assertHtml('<span class="delete">abc</span>', "abc", ""),
		assertHtml('<span class="insert">abc</span>', "", "abc"),
		assertHtml('<span class="delete">ab</span><span class="insert">x</span>' 
				 + '<span class="same">123</span><span class="delete">c</span>'
				 + '<span class="insert">yz</span>', "ab123c", "x123yz"),
		assertHtml('<span class="delete">&#38;</span><span class="insert">&#62;</span>', "&", ">"),
	];
	let summary = results.map(x => x[0] ? '.' : 'F').join("");
	let failuredetails = results.filter(x => !x[0]).map(x => '\n' + htmlEncode(x[1])).join("");
	return summary + failuredetails;
}

function assertMatrix(expected, a, b) {
	let actual = new Diff(a, b).editMatrix;
	let message = `Matrix for '${a}' and '${b}'. Expected [${expected.join("|")}] but was [${actual.join("|")}].`;
	return [isMatrixEqual(expected, actual), message];
}

function isMatrixEqual(a, b) {
	if (a.length != b.length) return false;
	for (var r = 0; r < a.length; r++) {
		if (a[r].length != b[r].length) return false;
		for (var c = 0; c < a[r].length; c++) {
			if (a[r][c] != b[r][c]) return false;
		}
	}
	return true;
}

function assertStringsEqual(expected, a, b) {
	let actual = new Diff(a, b).areEqual;
	let message = `Strings equal for '${a}' and '${b}'. Expected [${expected}] but was [${actual}].`;
	return [expected == actual, message];
}

function assertEditStringA(expected, a, b) {
	let actual = new Diff(a, b).editStringA;
	let message = `Edit String from '${a}' to '${b}'. Expected [${expected}] but was [${actual}].`;
	return [expected == actual, message];
}

function assertInDel(expected, a, b) {
	let actual = new Diff(a, b).inDel.map(x => `${x.operation}{${x.text}}`).join("");
	let message = `In-Del from '${a}' to '${b}'. Expected [${expected}] but was [${actual}].`;
	return [expected == actual, message];
}

function assertHtml(expected, a, b) {
	let actual = diffToHtml(new Diff(a, b));
	let message = `HTML for '${a}' to '${b}'. Expected [${expected}] but was [${actual}].`;
	return [expected == actual, message];
}

// Diff

function Diff(a, b) {
	this.editMatrix = editMatrix(a, b);
	this.areEqual = (0 == this.editMatrix[a.length][b.length]);
	this.editStringA = editString(this.editMatrix);
	this.inDel = inDel(a, b, this.editStringA);
}

function editMatrix(a, b) {
	let rows = a.length + 1;
	let cols = b.length + 1;
	let m = new Array(rows)
	for (var r = 0; r < rows; r++) m[r] = new Array(cols);
	for (var c = 0; c < cols; c++) m[0][c] = c;
	for (var r = 1; r < rows; r++) m[r][0] = r;
	for (var r = 1; r < rows; r++)
		for (var c = 1; c < cols; c++)
			m[r][c] = Math.min(m[r-1][c-1], m[r][c-1], m[r-1][c]) + (a[r-1]==b[c-1] ? 0 : 1);
	return m;
}

function editString(m) {
	var r = m.length - 1;
	var c = m[0].length - 1;
	var result = "";
	while ((r > 0) && (c > 0)) {
		var nextStep = Math.min(m[r-1][c], m[r][c-1]);
		if (m[r-1][c-1] == m[r][c] && m[r][c] <= nextStep) {
			result = "=" + result;
			r--;
			c--;
		} else if (m[r][c-1] == nextStep) {
			result = "+" + result;
			c--;
		} else {
			result = "-" + result;
			r--;
		}
	}
	for (; r > 0; r--) result = "-" + result;
	for (; c > 0; c--) result = "+" + result;
	return result;
}

function inDel(a, b, editString) {
	let as = a.split("");
	let bs = b.split("");
	let es = editString.split("");
	result = [];
	while (es.length > 0) {
		var text = "";
		while (es[0] == "=") {
			text += as.shift();
			es.shift();
			bs.shift();
		}
		if (text.length > 0) result.push(new Edit("=", text));

		var deletions = "";
		var additions = "";
		while (es.length > 0 && es[0] != "=") {
			if (es[0] == "-") deletions += as.shift();
			if (es[0] == "+") additions += bs.shift();
		 	es.shift();
		}
		if (deletions.length > 0) result.push(new Edit("-", deletions));
		if (additions.length > 0) result.push(new Edit("+", additions));
	}
	return result;
}

function Edit(operation, text) {
	this.operation = operation;
	this.text = text;
}

function diffToHtml(diff) {
	var result = "";
	let toClass = { 
		"-" : "delete", 
		"+" : "insert",
		"=" : "same"
	};
	for (var e of diff.inDel) {
		result += `<span class="${toClass[e.operation]}">${htmlEncode(e.text)}</span>`;
	}
	return result;
}

function htmlEncode(s) {
	return s.replace(/[^a-zA-Z0-9 ]/g, c => `&#${c.charCodeAt(0)};`)
}

// User interface

function setUpUserInterface() {
	clearOnceOnFocus("diff-from");
	clearOnceOnFocus("diff-to");

	element("diff-show").onclick = showDiff;

	console.log("Test output: " + runTests());

	showDiff();
}

function element(id) {
	return document.getElementById(id);
}

function clearOnceOnFocus(id) {
	let e = element(id);
	e.onfocus = new ClearOnce(e).do;
}

function ClearOnce(element) {
	var shouldDo = true;
	this.do = function() {
		if (shouldDo) {
			element.value = "";
			shouldDo = false;
		}
	}
}

function showDiff() {
	let a = element("diff-from").value;
	let b = element("diff-to").value;
	let html = diffToHtml(new Diff(a, b));
	element("diff-result").innerHTML = html;
}

// Main

setUpUserInterface();
