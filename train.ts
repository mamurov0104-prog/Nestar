let count = 0;
const printNumbers = setInterval((): void => {
	count++;
	for (let i = 1; i <= 5; i++) {
		console.log(i);
	}
	if (count === 5) clearInterval(printNumbers);
}, 1000);
