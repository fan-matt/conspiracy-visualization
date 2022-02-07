export function formatDate(dateTime: string): string {
    let date = dateTime.substring(0, dateTime.indexOf('T'));

    let year = date.substring(0, date.indexOf('-'));
    let rest = date.substring(date.indexOf('-') + 1);

    let month = rest.substring(0, rest.indexOf('-'));
    let day = rest.substring(rest.indexOf('-') + 1);

    let monthString: string;

    switch (month) {
        case '01':
            monthString = 'January';
            break;

        case '02':
            monthString = 'February';
            break;

        case '03':
            monthString = 'March';
            break;

        case '04':
            monthString = 'April';
            break;

        case '05':
            monthString = 'May';
            break;

        case '06':
            monthString = 'June';
            break;

        case '07':
            monthString = 'July';
            break;

        case '08':
            monthString = 'August';
            break;

        case '09':
            monthString = 'September';
            break;

        case '10':
            monthString = 'October';
            break;

        case '11':
            monthString = 'November';
            break;

        case '12':
            monthString = 'December';
            break;

        default:
            monthString = month;
    }

    return monthString + ' ' + day + ', ' + year;
}