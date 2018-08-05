/* by: ZIMONH src: https://github.com/zimonh/Bookmarks-Merger
   License: https://creativecommons.org/licenses/by-nc-sa/4.0/ */

	const bookmark_html_to_object = browser => {

	let chrome_or_firefox = 'DL > DT > DL > DT', //temp query
		Header = ''; //temp header

	if (browser === 'firefox') chrome_or_firefox = 'DL > DT'; //adjust query based on browser

	const obj = {}, //object that will hold all the bookmark data
		holder = document.querySelector('div.' + browser); //the div used to parse the text area data to make sure all tags are closed.

	holder.innerHTML = document.querySelector('textarea.' + browser).value; //fill the holder based on data in text area

	const holder_elements = holder.querySelectorAll(chrome_or_firefox); //get all the bookmark element


	for (let element of holder_elements) { //loop trough the element
		const H3 = element.querySelector('H3'); //the header
		if (H3 !== null) { //if this is a header
			if (H3.innerHTML !== 'From Google Chrome') { //ignore the 'From Google Chrome' header
				Header = H3.innerHTML; //set the header value
				obj[Header] = []; //create a new object with the name of the header and make it an empty array
			}
		} else { //if its not a header
			const A = element.querySelector('A'); //get the A element
			obj[Header].push({ //push into the object with the name of the header
				Header, //the header
				href: A.getAttribute('HREF').replace(/www./, ''), //the href
				text: A.innerHTML, //the text in the link
				add_date: A.getAttribute('ADD_DATE') //the date attribute
			});
		}
	}
	return obj; //return the completed object
};



const removeDuplicates = (myArr, prop) => myArr.filter((obj, pos, arr) => arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos);

//creates single bookmark html
const bookmarks = (add_date, href, text) => `<DT><A ADD_DATE="${add_date}" HREF="${href}">${text}</A>
`;

//creates folder html
const headers = (input, title) => `
<DT><H3>${title}</H3>
<DL><p>
${input}
</DL><p>`;

const bookmark_object_to_html = (bookmarksObj) => {

	const temp = {}; //will hold => folder: "strings of bookmarks"


	for (let folder in bookmarksObj) { //for each folder
		const tempObj = bookmarksObj[folder]; //holds the
		temp[folder] = '';
		for (let i in tempObj) { //for each bookmark
			const bookmark = tempObj[i]; //the bookmark object
			temp[tempObj[i].Header] += bookmarks(bookmark.add_date, bookmark.href, bookmark.text); //create string of bookmark data
		}
	}

	let withHeader = ''; //temp string to get the bookmarks with headers

	for (let folder in temp) withHeader += headers(temp[folder], folder); //for each folder add a header to the string

	//add all html into a bookmark document
	return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
It will be read and overwritten.
DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks Menu</H1>

<DL><p>${withHeader}</DL>`;
};



const merge = () => {
	const chromeObj = bookmark_html_to_object('chrome'); //the chrome object that holds all the bookmark data
	const firefoxObj = bookmark_html_to_object('firefox'); //the firefox object that holds all the bookmark data

	//make sure chrome has all the folders firefox has
	for (let folder in firefoxObj)
		if (chromeObj[folder] === undefined) chromeObj[folder] = []; //add the objects

	//loop trough all the folders (of chrome)
	for (let folder in chromeObj) {

		//add the firefox bookmarks
		if (firefoxObj[folder] !== undefined) chromeObj[folder].push(...firefoxObj[folder]);

		//sort (optional)
		chromeObj[folder] = chromeObj[folder].sort(function(a, b) {
			const nameA = a.href.toUpperCase(); // ignore upper and lowercase
			const nameB = b.href.toUpperCase(); // ignore upper and lowercase
			if (nameA < nameB) return -1;
			if (nameA > nameB) return 1;
			return 0;
		});

		//remove duplicates
		chromeObj[folder] = removeDuplicates(chromeObj[folder], 'href');

	}
	//fill the text area with the merged and taged data
	document.querySelector('.merge').innerHTML = bookmark_object_to_html(chromeObj);

};