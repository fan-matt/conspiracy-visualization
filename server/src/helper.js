
exports.formattedDateString = (date)=> {
	var string = date.getUTCFullYear().toString();
	var month = date.getMonth()
	if(month < 9){
		string += '0';
	}
	string += (month + 1).toString();
	day = date.getUTCDate();
	if(day < 10){
		string += '0';
	}
	string += date.getUTCDate();
	return string;
};
