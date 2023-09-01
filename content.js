"use strict";

class Application {
    activeRegistrationToggle = true;
    body;
    base;

    program_skeleton = `
    <div id="main_container">
        <div class="controls">
            <div class="controls_right_container">
                <button class="save">Save Selections</button>
                <div class="active_course_checkbox">
                </div>
                <div class="term_select">
                    <p>Select Term: </p>
                    <select></select>
                </div>
                <div class="subj_select">
                    <p>Select Subject: </p>
                    <select></select>
                </div>
                <div class="selected_courses">
                    <table>
                        <tbody>
                        <tr>
                            <th>Course Name</th>
                            <th>CRN</th>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="course_select_container">
                <div class="course_select_subject test">
                    <div class="course_select_header ">Test<span class="close">×</span></div>
                    <div class="course_select_list">
                        <div class="course_select_item"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="table">
            <div class="table_container">
                <div class="column">
                    <div class="linemarkers">
                    <div class="header_item">ㅤ</div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <div class="time">
                        <div class="timeblock">8 AM</div>
                        <div class="timeblock">9 AM</div>
                        <div class="timeblock">10 AM</div>
                        <div class="timeblock">11 AM</div>
                        <div class="timeblock">12 PM</div>
                        <div class="timeblock">1 PM</div>
                        <div class="timeblock">2 PM</div>
                        <div class="timeblock">3 PM</div>
                        <div class="timeblock">4 PM</div>
                        <div class="timeblock">5 PM</div>
                        <div class="timeblock">6 PM</div>
                        <div class="timeblock">7 PM</div>
                        <div class="timeblock">8 PM</div>
                    </div>
                </div>

                <div class="column">
                    <div class="day">
                        <div class="linemarkers">
                        <div class="header_item">Monday</div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
                <div class="column">
                    <div class="day">
                        <div class="linemarkers">
                        <div class="header_item">Tuesday</div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
                <div class="column">
                    <div class="day">
                        <div class="linemarkers">
                        <div class="header_item">Wednesday</div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
                <div class="column">
                    <div class="day">
                        <div class="linemarkers">
                        <div class="header_item">Thursday</div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `

    //controls data
    selectedTerm = "";
    selectedTermValue = "";
    selectedSubj = []; //shown subjects
    shownCourses = [];//selected courses from the course list 
    selectedSections = [] //selected sections on the table
    crnToCourse = {}//helper for init()

    //not cookied
    shownSections = {} //holds the div of each section currently existing on the table
    courseSectionCache = {}//course data cash

    activeCourseList = [];//active registration courses
    availableCourses = {}; //contains the form to fetch data for the course
    courseNames = {}
    activeCourseToggle = true;

    isInitialized = false


    //convert section day to number
    dayToNumber = {
        M: 0,
        T: 1,
        W: 2,
        R: 3
    }

    constructor() {
        this.base = document.children[0].children[1].children[1].contentDocument;

        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap'

        // Append the link element to the head of the document
        document.head.appendChild(linkElement);

        //add html skeleton for program
        this.body = document.createElement('div');
        this.body.setAttribute('id', 'program_container');
        this.body.innerHTML = this.program_skeleton;
        document.children[0].appendChild(this.body);

        //active Course toggle
        const activeCourseCheckbox = document.querySelector(".active_course_checkbox");
        activeCourseCheckbox.innerHTML = `
            <input type="checkbox" id="activeCheckbox" name="activeCheckbox" value="checkboxValue" checked>
            <label for="activeCheckbox">Show Active Registration</label>
        `;
        const checkbox = document.getElementById("activeCheckbox");
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                this.activeCourseToggle = true;
            } else {
                this.activeCourseToggle = false;
            }
            this.buildTable();
        });

        // Day ELements
        const dayElements = document.querySelectorAll('.day');
        const baseWidth = 130;
        for (const day of dayElements) {
            day.onmouseenter = (e) => {
                const element = e.currentTarget;
                element.style.width = element.scrollWidth + 'px';
                element.style.zIndex = 100;
                for (const sibling of dayElements) {
                    if (sibling !== element) sibling.classList.add('dimmed');
                }
            }
            day.onmouseleave = (e) => {
                const element = e.currentTarget;
                element.style.width = baseWidth + 'px';
                element.style.zIndex = 50;
                for (const sibling of dayElements) {
                    sibling.classList.remove('dimmed');
                }
            }
        }

        //Save button
        document.querySelector('.save').addEventListener('click', (e) => {
            this.persistControlsToCookie();
        })

        //load previously saved controls
        this.getControlsFromCookie();

        //initialize and load controls


        //toggle visibility based on the current page
        const frame = document.querySelector('frame[name="mainFrame"]');

        const handleFrameLoad = () => {
            console.log(frame.contentDocument.querySelector('title').innerText);
            if ((frame.contentDocument.querySelector('title').innerText == "Registration")) {
                if (!this.isInitialized) {
                    this.isInitialized = true;
                    this.init().then(() => {
                        this.buildTable();
                        if ((frame.contentDocument.querySelector('title').innerText == "Registration")) this.toggleVisible(true);
                    });
                } else {
                    if ((frame.contentDocument.querySelector('title').innerText == "Registration")) this.toggleVisible(true);
                }
            }
            else {
                this.toggleVisible(false);
            }
        }
        frame.addEventListener('load', handleFrameLoad);
    }

    toggleVisible(isVisible) {
        const element = document.querySelector('#program_container');
        if (isVisible == true) {
            element.style.visibility = 'visible';
        }
        else {
            element.style.visibility = 'hidden';
        }
    }

    async init() {
        //set a default term based on the latest available term (first option is none)
        await this.buildTermList();
        const selectElement = document.querySelector('select[name="p_term"]');
        if (this.selectedTerm == "") {
            const secondOption = selectElement.options[1];
            const secondOptionValue = secondOption.value;

            secondOption.selected = true;

            this.selectedTerm = secondOption.textContent;
            this.selectedTermValue = secondOptionValue;
        }
        for (let i = 0; i < selectElement.options.length; i++) {
            if (selectElement.options[i].value === this.selectedTermValue) {
                selectElement.options[i].selected = true;
                break;
            }
        }

        //Subject list for the selected term
        await this.buildSubjectList();

        //Get the currently registered courses
        const activeRegPromise = [this.getActiveRegistration()]

        //Loop through selectedSubj to build course lists
        if (this.selectedSubj.length > 5) this.selectedSubj.splice(5);
        let promises = [];
        for (const subj of this.selectedSubj) {
            promises.push(this.buildCourseList(subj));
        }

        await Promise.all(promises);


        //build table 
        // commented out because I have over engineered this. takes too much time to load stuff.
        promises = []
        for (const course of this.shownCourses) {
            if (!(this.selectedSubj.includes(course.substring(0, 3)))) {
                promises.push(this.buildCourseList(course.substring(0, 3)));
            }
        }
        await Promise.all(promises)

        const courseItemElement = document.querySelectorAll(`.course_select_item`);
        for (const courseItem of courseItemElement) {
            if (this.shownCourses.includes(courseItem.getAttribute('data-course'))) {
                if (courseItem) courseItem.classList.add('selected');
            }
        }

        //find the course from crn
        promises = []
        for (const section of this.selectedSections) {
            if (!(this.selectedSubj.includes(this.crnToCourse[section].substring(0, 3)))) {
                promises.push(this.buildCourseList(this.crnToCourse[section].substring(0, 3)));
            }
        }
        await Promise.all(promises);

        promises = []
        for (const course of this.shownCourses) {
            promises.push(this.updateTable(course, true));
        }
        for (const section of this.selectedSections) {
            promises.push(this.updateTable(this.crnToCourse[section], true));
        }
        await Promise.all(promises);

        await Promise.all(activeRegPromise)

        this.buildSelectedCourses();
    }

    //Cookies to save progress
    getControlsFromCookie() {
        // Retrieving cookies and initializing if they don't exist
        let selectedTerm = Cookies.get('selectedTerm');
        if (selectedTerm === undefined) {
            selectedTerm = '';
        }

        let selectedTermValue = Cookies.get('selectedTermValue');
        if (selectedTermValue === undefined) {
            selectedTermValue = '';
        }

        let selectedSubj = Cookies.get('selectedSubj');
        if (selectedSubj === undefined) {
            selectedSubj = [];
        } else {
            selectedSubj = JSON.parse(selectedSubj);
        }

        let selectedSections = Cookies.get('selectedSections');
        if (selectedSections === undefined) {
            selectedSections = [];
        } else {
            selectedSections = JSON.parse(selectedSections);
        }

        let shownCourses = Cookies.get('shownCourses');
        if (shownCourses === undefined) {
            shownCourses = [];
        } else {
            shownCourses = JSON.parse(shownCourses);
        }

        let crnToCourse = Cookies.get('crnToCourse');
        if (crnToCourse === undefined) {
            crnToCourse = {};
        } else {
            crnToCourse = JSON.parse(crnToCourse);
        }

        // Assign the initialized values to class properties
        this.selectedTerm = selectedTerm;
        this.selectedTermValue = selectedTermValue;
        this.selectedSubj = selectedSubj;
        this.selectedSections = selectedSections;
        this.shownCourses = shownCourses;
        this.crnToCourse = crnToCourse;
    }

    persistControlsToCookie() {
        Cookies.set('selectedTerm', this.selectedTerm, { expires: 180 });
        Cookies.set('selectedTermValue', this.selectedTermValue, { expires: 180 });
        Cookies.set('selectedSubj', JSON.stringify(this.selectedSubj), { expires: 180 });
        Cookies.set('selectedSections', JSON.stringify(this.selectedSections), { expires: 180 });
        Cookies.set('shownCourses', JSON.stringify(this.shownCourses), { expires: 180 });
        Cookies.set('crnToCourse', JSON.stringify(this.crnToCourse), { expires: 180 });
    }

    //Selected Courses
    async buildSelectedCourses() {
        const selectedCoursesContianer = document.querySelector('.selected_courses');

        const tbody = selectedCoursesContianer.querySelector('tbody');
        for (let i = tbody.children.length - 1; i > 0; i--) {
            tbody.removeChild(tbody.children[i]);
        }
        for (const crn of this.selectedSections) {
            const row = document.createElement("tr");

            const cell = document.createElement("td");
            cell.textContent = this.crnToCourse[crn];

            const cell2 = document.createElement("td");
            cell2.textContent = crn;

            row.appendChild(cell);
            row.appendChild(cell2);
            tbody.appendChild(row)
        }
    }

    //Table
    buildTable = () => {
        const addToTable = (key, classToAdd) => {
            function getTimeOffset(timeStamp) {
                // Convert the time stamp to hours and minutes
                const [time, period] = timeStamp.split(' ');
                const [hours, minutes] = time.split(':').map(Number);

                // Convert to 24-hour format if necessary
                let adjustedHours = hours;
                if (period.toLowerCase() === 'pm' && hours !== 12) {
                    adjustedHours += 12;
                }

                // Calculate the total minutes since 8 AM
                const totalMinutes = (adjustedHours - 8) * 60 + minutes;

                // Calculate the offset in 15-minute intervals
                const intervalMinutes = 15;
                const offsetIntervals = Math.floor(totalMinutes / intervalMinutes);

                return offsetIntervals;
            }

            function fixIfOverlap(day, section) {
                function findOverlappingElements(targetElement) {
                    function areElementsOverlapping(element1, element2) {
                        const rect1 = element1.getBoundingClientRect();
                        const rect2 = element2.getBoundingClientRect();

                        // Check for horizontal overlap
                        const horizontalOverlap = rect1.right > rect2.left && rect1.left < rect2.right;

                        // Check for vertical overlap
                        const verticalOverlap = rect1.bottom > rect2.top && rect1.top < rect2.bottom;

                        // If both horizontal and vertical overlap, elements are overlapping
                        return horizontalOverlap && verticalOverlap;
                    }
                    const allElements = day.querySelectorAll('.section');

                    for (const element of allElements) {
                        if (element !== targetElement && areElementsOverlapping(targetElement, element)) {
                            targetElement.style.left = (parseInt(getComputedStyle(targetElement).left)) + element.clientWidth +
                                (parseInt(getComputedStyle(element).getPropertyValue('margin-left')) * 2) + 'px';
                            return true;
                        }
                    }
                    return false;
                }

                let i = 0
                while (findOverlappingElements(section) & i < 20) {
                    console.log('overlap')
                    i++;
                }
            }

            //height for one hour block
            const timeblockHeight = document.querySelector('.timeblock').clientHeight;

            //add section div to each of the days
            try {
                const sectionsDays = [...this.shownSections[key].getAttribute('data-days')];
                sectionsDays.forEach((day) => {
                    day = this.dayToNumber[day];
                    const dayElement = document.querySelectorAll('.day')[day];

                    const sectionElement = this.shownSections[key].cloneNode(true);
                    sectionElement.classList.add(classToAdd);

                    //calculate height based on time
                    const [sectionStart, sectionEnd] = sectionElement.getAttribute('data-time').split('-');
                    const startTime = getTimeOffset(sectionStart.trim());
                    const endTime = getTimeOffset(sectionEnd.trim());
                    sectionElement.style.height = `${(endTime - startTime) / 4 * timeblockHeight}px`;
                    //set section start time offset
                    sectionElement.style.top = `${(startTime / 4 * timeblockHeight) +
                        parseFloat(getComputedStyle(document.documentElement).fontSize) + 2}px`;

                    sectionElement.addEventListener('click', (e) => this.handleSectionSelect(e));
                    dayElement.appendChild(sectionElement);
                    fixIfOverlap(dayElement, sectionElement);
                });
            } catch (error) {
                console.log(error)
                console.log(key)
                console.log(this.crnToCourse[key])
                console.log(this.shownSections);
            }
        }

        console.log('build table')

        //remove sections that should not be visible based on whats selected from course list
        for (const crn in this.shownSections) {
            if (!(this.shownCourses.includes(this.shownSections[crn].getAttribute('data-course')))) {
                if (!(this.selectedSections.includes(crn)) && (!(this.activeCourseList.includes(crn)))) {
                    delete this.shownSections[crn];
                }
            }
        }

        //reset the table first
        const dayElements = document.querySelectorAll('.day');
        for (const day of dayElements) {
            for (let i = day.children.length - 1; i >= 0; i--) {
                if (day.children[i].classList.contains('section')) {
                    day.children[i].remove();
                }
            }
        }

        //add active registration courses to table first
        if (this.activeCourseToggle) {
            for (const activeCourse of this.activeCourseList) {
                addToTable(activeCourse, 'active_course')
            }
        }

        //add selected courses to table
        for (const section of this.selectedSections) {
            addToTable(section, 'selected_section');
        }

        //add the rest shown courses to table
        for (const section in this.shownSections) {
            if (!(this.selectedSections.includes(section))) {
                if (this.activeCourseToggle && !(this.activeCourseList.includes(section))) {
                    //add nothing to classlist because cant add empty string
                    addToTable(section, 'nothing');
                }
                else if (this.activeCourseToggle && this.activeCourseList.includes(section)) {
                    continue;
                }
                else if (this.shownCourses.includes(this.crnToCourse[section])) {
                    addToTable(section, 'nothing');
                }
            }
        }
        console.log('done build table');
    }

    //gets the course data if not in cache, then builds the div template for section, then adds it to shownSections
    async updateTable(course, show) {
        console.log('update table')
        //adds course data to courseSectionCache, used by updateTable that provides it the form from availableCourses
        const getCourseData = async (form, course) => {
            function formDataToString(formData) {
                let text = "";
                formData.forEach((value, key) => {
                    if (value == "%") value = "%25";
                    text = text + key + "=" + value.replace(" ", "+") + "&";
                });
                return text + "SUB_BTN=View+Sections";
            }

            const extractCourseData = (html) => {
                let sectionList = [];
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const dataTable = doc.querySelector('table.datadisplaytable');

                const courseSections = dataTable.children[1].children;
                for (let i = 2; i < courseSections.length; i++) {
                    let sectionData = courseSections[i].innerText.split('\n');
                    if (sectionData.length > 19) sectionData = sectionData.slice(4);
                    sectionList.push(sectionData);
                }
                this.courseSectionCache[course] = sectionList;
            }

            const formData = new FormData(form);
            const formDataString = formDataToString(formData);
            const url = form.action;

            const requestOptions = {
                method: "POST",
                body: formDataString
            };

            return fetch(url, requestOptions)
                .then(response => response.text())
                .then(html => extractCourseData(html))
                .catch(error => console.error("Error:", error));
        }

        if (!(course in this.courseSectionCache)) {
            await getCourseData(this.availableCourses[course], course);
        }

        if (show) {
            const sectionList = this.courseSectionCache[course];

            for (let i = 0; i < sectionList.length; i++) {
                const section = sectionList[i];

                //create div element
                const sectionElement = document.createElement('div');
                sectionElement.classList.add('section');
                if (section[1] == 'C') sectionElement.classList.add('closed_section');
                sectionElement.setAttribute('data-course', course);
                sectionElement.setAttribute('data-crn', `${section[2]}`);
                sectionElement.innerHTML = `
                    <div>${section[3] + section[4]}-${section[5]}</div>
                    <div>${section[8]}</div>
                    <div>${section[14]}</div>
                    <div>${section[16]}</div>
                    `;

                sectionElement.setAttribute('data-days', section[9]);
                sectionElement.setAttribute('data-time', section[10]);

                //add section to shown sections to build the table later
                this.shownSections[section[2]] = sectionElement.cloneNode(true);
                this.crnToCourse[section[2]] = course
                sectionElement.remove();
            }
        }
        console.log(' done update table')
    }

    //Event Handlers
    handleSectionSelect(event) {
        const crn = event.currentTarget.getAttribute('data-crn');
        const course = event.currentTarget.getAttribute('data-course');

        //deselect
        if (this.selectedSections.includes(crn)) {
            this.selectedSections.splice(this.selectedSections.indexOf(crn), 1);
        }
        //select
        else {
            this.selectedSections.push(crn);
            this.crnToCourse[crn] = course;
            this.shownCourses.splice(this.shownCourses.indexOf(course), 1);

            const courseItemElement = document.querySelector(`div[data-course="${course}"].course_select_item`);
            if (courseItemElement) courseItemElement.classList.remove('selected');
        }
        this.buildSelectedCourses();
        this.buildTable();
    }

    handleCourseSelect(event) {
        // Check if the click occurred on a course_select_item
        if (event.target.classList.contains('course_select_item')) {
            event.target.classList.toggle('selected');
            if (event.target.classList.contains('selected')) {
                this.shownCourses.push(event.target.getAttribute('data-course'));
            } else {
                this.shownCourses.splice(this.shownCourses.indexOf(event.target.getAttribute('data-course')), 1);
            }
            this.updateTable(event.target.getAttribute('data-course'), event.target.classList.contains('selected'))
                .then(() => this.buildTable());
        }

        // Check if the click occurred on the close button
        if (event.target.classList.contains('close')) {
            event.currentTarget.removeEventListener('click', this.handleCourseSelect);
            event.currentTarget.remove(); // Remove the subjectElement
            const subj = event.currentTarget.getAttribute('data-subject');

            this.selectedSubj.splice(this.selectedSubj.indexOf(subj), 1);
        }
    }

    handleTermSelect(event) {
        function resetCourseSelectView() {
            const container = document.querySelector('.course_select_container');
            const childElements = container.children;
            for (let i = childElements.length - 1; i >= 0; i--) {
                const child = childElements[i];
                if (!child.classList.contains("test")) {
                    container.removeChild(child);
                }
            }
        }

        if (event.target.value !== this.selectedTermValue) {
            this.selectedTermValue = event.target.value;
            this.selectedTerm = event.target.selectedOptions[0].innerText.replace('(View only)', '').trim();
            //get the subject list for that term
            this.buildSubjectList();
            //reset the selected subjects
            this.selectedSubj = []
            //reset everything
            this.availableCourses = {};
            this.selectedSections = [] //selected sections on the table
            this.shownCourses = [];//selected courses from the course list 
            this.shownSections = {} //shown sections on the table
            this.courseSectionCache = {}//course data cash
            this.activeCourseList = []
            this.crnToCourse = {}

            resetCourseSelectView();
            this.getActiveRegistration().then(() => this.buildTable());
            this.buildSelectedCourses();
        }
    }

    handleSubjectSelect(event) {
        if (!this.selectedSubj.includes(event.target.value)) {
            if (this.selectedSubj.length >= 5) {
                alert('Please remove a subject first (Max 5)');
                return;
            }
            this.selectedSubj.push(event.target.value);
            this.buildCourseList(event.target.value, true);
        }
    }

    //Data Retrieval and DOM addition
    //doesnt affect class variables
    async buildTermList() {
        //add term select to display
        const addToDisplay = (html) => {
            // Parse the HTML using DOMParser
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Find the select element with name "p_term" using attribute selector
            const selectElement = doc.querySelector(`select[name="p_term"]`);

            if (selectElement) {
                // Clone the select element and add it to the DOM
                const clonedSelectElement = selectElement.cloneNode(true);

                //get the container for the term list
                const container = document.querySelector('.term_select');
                container.replaceChild(clonedSelectElement, container.querySelector('select'));

                //add event listener when user changes selected term
                clonedSelectElement.addEventListener("change", (e) => this.handleTermSelect(e));
            } else {
                console.log(`Select element with name "p_term" not found.`);
            }
        }

        //get Term data
        const term_list_url = "https://banner.aus.edu/axp3b21h/owa/bwskfcls.p_sel_crse_search";
        await this.sendGetRequest(term_list_url)
            .then(html => {
                addToDisplay(html);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    //doesnt affect class variables
    async buildSubjectList() {
        //add subject select to display
        const addToDisplay = (html) => {
            // Parse the HTML using DOMParser
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Find the select element with name "sel_subj" using attribute selector
            const selectElement = doc.querySelector(`select[name="sel_subj"]`);

            if (selectElement) {
                // Clone the select element and add it to the DOM
                const clonedSelectElement = selectElement.cloneNode(true);

                //get the container for the subject li  st
                const container = document.querySelector('.subj_select');
                container.replaceChild(clonedSelectElement, container.querySelector('select'));

                //add event listener when user changes selected subject
                clonedSelectElement.addEventListener("change", (e) => this.handleSubjectSelect(e));
            } else {
                console.log(`Select element with name "sel_subj" not found.`);
            }
        }
        //get subject data
        const subj_list_url = "https://banner.aus.edu/axp3b21h/owa/bwckgens.p_proc_term_date";
        const formData = new URLSearchParams();
        formData.append("p_calling_proc", "P_CrseSearch");
        formData.append("p_term", this.selectedTermValue);
        this.sendPostRequest(subj_list_url, formData)
            .then(html => {
                addToDisplay(html)
            });
    }

    //adds to availableCourses (list of forms to get course)
    async buildCourseList(subj) {
        const extractCourses = (html) => {
            let courseList = [];

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const dataTable = doc.querySelectorAll('table.datadisplaytable')[1];

            const courseEnteries = dataTable.querySelectorAll('tr');
            for (let i = 2; i < courseEnteries.length; i++) {
                const course = [
                    subj + courseEnteries[i].children[0].innerText,
                    courseEnteries[i].children[1].innerText,
                    courseEnteries[i].children[2].children[0]
                ]
                courseList.push(course);
                this.availableCourses[course[0]] = course[2];
                this.courseNames[course[0]] = course[1];
            }
        }

        const createCourseSelectView = () => {
            if (show) {
                const mainContainerElement = document.querySelector('.course_select_container');
                const subjectContainerElement = document.querySelector('.test').cloneNode(true);
                const courseItemElement = subjectContainerElement.children[1].children[0];

                let courseList = []
                for (const crse in this.courseNames) {
                    if (crse.substring(0, 3) == subj) courseList.push([crse, this.courseNames[crse]]);
                }

                subjectContainerElement.classList.remove('test');
                subjectContainerElement.setAttribute('data-subject', subj);
                subjectContainerElement.children[0].innerHTML = `${subj}<span class="close">×</span>`;
                courseList.forEach((course) => {
                    const element = courseItemElement.cloneNode(true);
                    element.textContent = course[0] + " " + course[1];
                    element.setAttribute('data-course', course[0]);
                    if (this.shownCourses.includes(course[0])) element.classList.add('selected');
                    subjectContainerElement.children[1].appendChild(element)
                });

                mainContainerElement.appendChild(subjectContainerElement);
                subjectContainerElement.addEventListener('click', (e) => this.handleCourseSelect(e));
            }
        }


        console.log('subj');
        console.log(subj);

        const show = this.selectedSubj.includes(subj);

        const params = new URLSearchParams();
        params.append("rsts", "dummy");
        params.append("crn", "dummy");
        params.append("term_in", this.selectedTermValue);
        params.append("sel_subj", "dummy");
        params.append("sel_day", "dummy");
        params.append("sel_schd", "dummy");
        params.append("sel_insm", "dummy");
        params.append("sel_camp", "dummy");
        params.append("sel_levl", "dummy");
        params.append("sel_sess", "dummy");
        params.append("sel_instr", "dummy");
        params.append("sel_ptrm", "dummy");
        params.append("sel_attr", "dummy");
        params.append("sel_subj", subj);
        params.append("sel_crse", "");
        params.append("sel_title", "");
        params.append("sel_from_cred", "");
        params.append("sel_to_cred", "");
        params.append("sel_ptrm", "%");
        params.append("begin_hh", "0");
        params.append("begin_mi", "0");
        params.append("end_hh", "0");
        params.append("end_mi", "0");
        params.append("begin_ap", "x");
        params.append("end_ap", "y");
        params.append("path", "1");
        params.append("SUB_BTN", "Course Search");

        //get the list of courses for that subject
        const url = "https://banner.aus.edu/axp3b21h/owa/bwskfcls.P_GetCrse";
        const requestOptions = {
            method: "POST",
            body: params.toString(),
        };

        return fetch(url, requestOptions)
            .then(response => response.text())
            .then(data => extractCourses(data))
            .then(() => createCourseSelectView())
            .catch(error => console.error("Error:", error));
    }

    //affects activeCourseList
    async getActiveRegistration() {
        const getCourseData = async (href, course) => {
            const extractCourseData = (html) => {
                console.log('extractCourseData')
                // Parse the HTML using DOMParser
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                const outertable = doc.querySelector('table.datadisplaytable');
                const crn = outertable.querySelector('.ddtitle').children[0].innerText.split(' - ')[1];
                const sectiontable = outertable.querySelector('table.datadisplaytable');

                const sectionData = sectiontable.children[1].children[1].innerText.split('\n');
                course = course.split(' - ');

                const location = sectionData[5].split(' ');
                let secLocation = ''
                for (let j = 0; j < location.length - 1; j++) {
                    if (location[j][0] === location[j][0].toUpperCase()) {
                        secLocation += location[j][0];
                    }
                }
                secLocation += ' ' + location[location.length - 1];

                //create div element
                const sectionElement = document.createElement('div');
                sectionElement.classList.add('section');
                sectionElement.setAttribute('data-course', course[1]);
                sectionElement.setAttribute('data-crn', crn);
                sectionElement.innerHTML = `
                    <div>${course[1]}-${course[2]}</div>
                    <div>${course[0]}</div>
                    <div>${sectionData[8]}</div>
                    <div>${secLocation}</div>
                    `;

                sectionElement.setAttribute('data-days', sectionData[3]);
                sectionElement.setAttribute('data-time', sectionData[2]);

                //add section to shown sections to build the table later
                this.shownSections[crn] = sectionElement.cloneNode(true);
                this.activeCourseList.push(crn)
                this.crnToCourse[crn] = course[1]
                sectionElement.remove();
            }

            console.log('getCourseData')


            return this.sendGetRequest(href)
                .then(html => extractCourseData(html))
                //.then(() => { return getSectionData() })
                .catch(error => {
                    console.error('Error:', error);
                });
        }

        //extract 'a' elements to activeCourseList
        const extractActiveRegistration = async (html) => {
            console.log('extractActiveRegistration')

            // Parse the HTML using DOMParser
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const dataTable = doc.querySelector('table.datadisplaytable');

            // Find all <th> elements of courses
            const courseEnteries = dataTable.querySelectorAll("th[colspan='4']");
            const promises = []
            for (const element of courseEnteries) {
                if (element.parentElement.nextElementSibling.children[1].innerText.includes(this.selectedTerm)) {
                    const a = element.children[0];
                    promises.push(getCourseData(a.href, element.textContent));
                }
            }
            await Promise.all(promises);
            console.log('done extracting active courses')
        }
        console.log('activeReg')
        //get the data
        const active_reg_url = "https://banner.aus.edu/axp3b21h/owa/bwsksreg.p_active_regs";
        return this.sendGetRequest(active_reg_url)
            .then(html => extractActiveRegistration(html))
            //.then(() => { return getSectionData() })
            .catch(error => {
                console.error('Error:', error);
            });

    }

    //Fetch API
    async sendGetRequest(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .catch(error => {
                console.error('Error sending GET request:', error);
                throw error;
            });
    }

    async sendPostRequest(url, formData) {
        return fetch(url, {
            method: "POST",
            body: formData.toString(),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .catch(error => {
                console.error('Error sending POST request:', error);
                throw error;
            });
    }
}


//remove selectedTerm and include into getActiveRegistration
//left to do : add activeRegistration toggle button and add it to table
// select term currently showing none
// filter course list by already completed

const app = new Application();