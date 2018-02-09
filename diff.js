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
	];
	let summary = results.map(x => x[0] ? '.' : 'F').join("");
	let failuredetails = results.filter(x => !x[0]).map(x => '\n' + x[1]).join("");
	return summary + failuredetails;
}

function assertMatrix(expected, a, b) {
	let actual = editMatrix(a, b);
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