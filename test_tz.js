const d = new Date('2026-03-04T00:15:00-03:00');
const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Montevideo',
    hour: 'numeric',
    hour12: false
});
console.log(formatter.format(d));
