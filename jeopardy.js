
const $tableHead = $('thead');
const $tableBody = $('tbody');
const height = 5;
const width = 5;

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
    // stored ids in a set to avoid duplicates
    const idSet = new Set;
    const getCategories = await axios.get(`http://jservice.io/api/random?count=10`);

    for (let i = 0; i < width; i++){
      let id = getCategories.data[i].category_id; // Sometimes throws error if no .id is found?
      idSet.add(id);
    }
    // debugging to ensure >= 5 category ids are collected
    idSet.size < width ? getCategoryIds() : getCategory(idSet);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    let gameContent = [];
    let arr = Array.from(catId);

    for (let i = 0; i < arr.length; i++){
        let ids = await axios.get(`http://jservice.io/api/clues?category=${arr[i]}`);
        let categorySet = {};
        let clueArray = [];
        for (let ind = 0; ind < height; ind++){
            //extract and create obj with key values for each id
            let obj = {}
                obj.question = ids.data[ind].question;
                obj.answer = ids.data[ind].answer;
            clueArray.push(obj);
        }
        categorySet.title = ids.data[0].category.title;
        categorySet.clues = clueArray;
        gameContent.push(categorySet);
    }

    fillTable(gameContent);
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable(gameContent) {
    // create header row
    const headers = document.createElement('tr');
    await gameContent.forEach(element => {
        $('<th>').text(element.title).appendTo($('<thead>')).appendTo(headers)
    })
    $tableHead.append(headers);

    // create question/answer cells
    for (let y = 0; y < width; y++) {
        const row = document.createElement('tr');

        for (let x = 0; x < height; x++) {
            let $cell = $('<td>').text(gameContent[x].clues[y].answer).appendTo(row);
            $('<div>').on('click', handleClick).text(gameContent[x].clues[y].question).addClass('question').appendTo($cell);
            $('<div>').on('click', handleClick).text(`${200 + 200 * y}`).addClass('category').appendTo($cell);
        }
        $tableBody.append(row);
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    evt.target.remove();
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $tableBody.empty();
    $tableHead.empty();
    console.log('start loading')
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    console.log('done loading')
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView();
    await getCategoryIds();
    hideLoadingView();
}

$('#start-button').on('click', setupAndStart)
