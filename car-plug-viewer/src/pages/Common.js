/*
 *
 */

export function searchItems(searchId, defaultSearchItems, extraSearchItems, extraSearchIndices) {
	const columns = [];
	const input = document.getElementById(searchId);
	var filter = input.value.toUpperCase();
	const table = document.getElementById("myTable");
	const tr = table.getElementsByTagName("tr");
	const itemsFound = [];
	
	if (filter.startsWith("?")) {
		let filterValid = false;
		const equalsIndex = filter.indexOf("=");
		if (equalsIndex > -1) {
			for (let i = 0; i < extraSearchItems.length; i++) {
				if (filter.indexOf(extraSearchItems[i]) > -1) {
					columns.push(extraSearchIndices[i]);
					filter = filter.substring(equalsIndex + 1);
					filterValid = true;
					break;
				}
			}
		}

		if (!filterValid) {
			filter = "";
		}
	}
	else {
		for (const item of defaultSearchItems) {
			columns.push(item);
		}
	}
	
	for (let i = 0; i < tr.length; i++) {
		for (const column of columns) {
			let td = tr[i].getElementsByTagName("td")[column];
			if (td) {
				let txtValue = td.textContent || td.innerText;
				if (txtValue.toUpperCase().indexOf(filter) > -1) {
					if (filter.match("0|([1-9][0-9]*)") && txtValue.match("0|([1-9][0-9]*)")) {
						// eslint-disable-next-line
						if (filter.localeCompare(txtValue) === 0) {
							tr[i].style.display = "";
							itemsFound.push(tr[i]);
							break;
						} else {
							tr[i].style.display = "none";
						}
					}
					else {
						tr[i].style.display = "";
						itemsFound.push(tr[i]);
						break;
					}
				} else {
					tr[i].style.display = "none";
				}
			}
		}
	}
	
	return itemsFound;
}

export function sortTable(column, byNumber=false) {
	const table = document.getElementById("myTable");
	//Set the sorting direction to ascending:
	let dir = "asc";
	
	/*Make a loop that will continue until
	no switching has been done:*/
	const rows = table.rows;
	const valueMap = new Map();
	
	let i;
	let shouldSwitch = false;

	const keys = [];

	while (!shouldSwitch) {
		for (i = 1; i < (rows.length - 1); i++) {
			/*Get the two elements you want to compare,
			one from current row and one from the next:*/
			const x = rows[i].getElementsByTagName("td")[column];
			const y = rows[i + 1].getElementsByTagName("td")[column];

			/*check if the two rows should switch place,
			  based on the direction, asc or desc:*/
			let key;
			if (!byNumber) {
				const xText = x.innerHTML.toLowerCase();
				const yText = y.innerHTML.toLowerCase();
				key = xText + "." + i;
				// ascending order
				if (dir === "asc") {
					if (xText > yText) {
						shouldSwitch = true;
					}
				}
				else {
					if (xText < yText) {
						shouldSwitch = true;
					}
				}
			}
			else {
				const xNum = Number(x.innerHTML);
				const yNum = Number(y.innerHTML);
				key = (10000 + Number(x.innerHTML)) * 10000 + i;
				// ascending order
				if (dir === "asc") {
					if (xNum > yNum) {
						shouldSwitch = true;
					}
				}
				else {
					if (xNum < yNum) {
						shouldSwitch = true;
					}
				}
			}
			keys.push(key);
			valueMap.set(key, rows[i]);
		}
		
		if (dir === "asc") {
			if (!shouldSwitch) {
				dir = "desc";
			}
		}
		else {
			break;
		}
	}
		
	if (shouldSwitch) {
		const x = rows[i].getElementsByTagName("td")[column];
		let key;
		if (!byNumber) {
			key = x.innerHTML.toLowerCase() + "." + i;
		}
		else {
			key = (10000 + Number(x.innerHTML)) * 10000 + i;
		}

		keys.push(key);
		valueMap.set(key, rows[i]);
		keys.sort();

		// acutal sorting here
		const parentNode = rows[1].parentNode;
		let firstRow = null;

		for (const key of valueMap.keys()) {
			parentNode.removeChild(valueMap.get(key));
		}

		for (const key of keys) {
			const newRow = valueMap.get(key);
			if (dir === "asc") {
				parentNode.appendChild(newRow);
			}
			else {
				if (firstRow == null) {
					parentNode.appendChild(newRow);
				}
				else {
					parentNode.insertBefore(newRow, firstRow);
				}
				firstRow = newRow;
			}
		}
	}
}
