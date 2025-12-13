import fs from 'fs'

let contents = fs.readFileSync('./athousand_sorted.csv', 'utf8')


let fens = contents.split('\n').map(_ => _.trim().split(',')[1])
arr_shuffle(fens)
fens = fens.slice(0, 500)

fs.writeFileSync('fens_tenk.txt', fens.join('\n'), 'utf8')

function arr_shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array
}