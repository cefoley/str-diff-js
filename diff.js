document.getElementById("test-output").innerHTML = runTests();

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
	];
	let summary = results.map(x => x[0] ? '.' : 'F').join("");
	let failuredetails = results.filter(x => !x[0]).map(x => '\n' + x[1]).join("");
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

function Diff(a, b) {
	this.editMatrix = editMatrix(a, b);
	this.areEqual = (0 == this.editMatrix[a.length][b.length]);
	this.editStringA = editString(this.editMatrix);
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
		var nextStep = Math.min(m[r-1][c-1], m[r-1][c], m[r][c-1]);
		if (m[r-1][c-1] == m[r][c] && m[r-1][c-1] == nextStep) {
			result = "=" + result;
			r--;
			c--;
		} else if (m[r-1][c] == nextStep) {
			result = "-" + result;
			r--;
		} else {
			result = "+" + result;
			c--;
		}
	}
	for (; r > 0; r--) result = "-" + result;
	for (; c > 0; c--) result = "+" + result;
	return result;
}
