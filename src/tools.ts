export function GetDate() {
    let dt = new Date();
    let y = dt.getFullYear();
    let m = (dt.getMonth()+1).toString().padStart(4, '0');
    let d = dt.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
}