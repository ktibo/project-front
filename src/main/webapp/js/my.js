let currentPage = 0;

$.ajaxSetup({
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

$(document).ajaxError(function(event, xhr, options) {
    alert('Error! ' + xhr.responseText);
});

function createPageButton(i) {
    const button = document.createElement('button');
    button.innerText = i + 1;
    button.id = 'b' + i;
    button.className ="btn btn-primary";
    //button.type="button";
    button.addEventListener("click", ev => {
        currentPage = i;
        refreshTable();
    });
    document.getElementById('pageButtons').appendChild(button);
}

function refreshTable() {
    $('#accountsTable tbody').empty();
    $('#pageButtons').empty();
    $.ajax({
        url: '/rest/players/count',
        type: 'get',
        dataType: 'json',
        success: function (data) {
            let pageCount = Math.ceil(data / getCountPerPage());
            pageCount = pageCount === 0 ? 1 : pageCount;
            currentPage = currentPage >= pageCount ? pageCount - 1 : currentPage;
            for (let i = 0; i < pageCount; i++) {
                createPageButton(i);
            }
            $("#b" + currentPage)[0].style.background = '#44d3ef';
            getPlayers();
        }
    });

    function getPlayers() {

        // var camera = window.FontAwesome.icon({ prefix: 'fas', iconName: 'camera' })
        // console.log(camera);

        $.ajax({
            url: '/rest/players',
            type: 'get',
            dataType: 'json',
            data: {pageNumber: currentPage, pageSize: getCountPerPage()},
            success: function (data) {
                let event_data = '';
                $.each(data, function (index, value) {
                    //console.log(value);
                    const id = value.id;
                    event_data += '<tr>';
                    event_data += '<td name = "id">' + id + '</td>';
                    event_data += '<td>' +
                        '<input value="' + value.name + '" id="nameInput' + id + '" style="display: none"/>' +
                        '<div id="name' + id + '">' + value.name + '</div></td>';
                    event_data += '<td>' +
                            '<input type="text" value="' + value.title + '" id="titleInput' + id + '" style="display: none"/>' +
                            '<div id="title' + id + '">' + value.title + '</div>'+
                        '</td>';
                    event_data += '<td>' +
                        '<select id="raceInput' + id + '" style="display: none"></select>' +
                        '<div id="race' + id + '">' + value.race + '</div></td>';
                    event_data += '<td>' +
                        '<select id="professionInput' + id + '" style="display: none"></select>' +
                        '<div id="profession' + id + '">' + value.profession + '</div></td>';
                    event_data += '<td>' + value.level + '</td>';
                    event_data += '<td>' + new Date(value.birthday).toLocaleDateString() + '</td>';
                    event_data += '<td>' +
                        '<select id="bannedInput' + id + '" style="display: none"></select>' +
                        '<div id="banned' + id + '">' + value.banned + '</div></td>';
                    event_data += '<td>' +
                        '<img src="img/edit.png" onclick="editAccount(this)">' +
                        '<img src="img/save.png" id="save' + id + '" style="display: none" onclick="saveAccount(this)"></td>';
                    event_data += '<td>' +
                        '<img src="img/delete.png" id="delete' + id + '" onclick="deleteAccount(this)"></td>';
                        //'<i className="fa-solid fa-trash-can"></i></td>';
                    event_data += '<tr>';
                });
                $('#accountsTable tbody').append(event_data);
            }
        });
    }

}

function saveAccount(target) {

    const id = getIdByTarget(target);

    const name = document.getElementById('nameInput' + id).value;
    const title = document.getElementById('titleInput' + id).value;
    const race = document.getElementById('raceInput' + id).value;
    const profession = document.getElementById('professionInput' + id).value;
    const banned = document.getElementById('bannedInput' + id).value;

    $.ajax({
        url: '/rest/players/' + id,
        type: "POST",
        dataType: 'json',
        data: JSON.stringify({ name: name, title: title, race: race, profession: profession, banned: banned }),
        success: function () {
            refreshTable();
        }
    });

}

function editAccount(target) {

    const id = getIdByTarget(target);

    target.style.display = "none";

    document.getElementById('delete' + id).style.display = "none";
    document.getElementById('save' + id).style.display = "block";

    editElement(id, 'name');
    editElement(id, 'title');

    editElement(id, 'banned', ['true', 'false']);
    editElement(id, 'race', getRaceArray());
    editElement(id, 'profession', getProfessionArray());

    function editElement(id, name, options) {
        let element = document.getElementById(name + id);
        element.style.display = "none";
        let select = document.getElementById(name + 'Input' + id);
        select.style.display = "block";

        if (options == null) return;

        populateSelect(select, options, element.innerHTML);

    }

}

function deleteAccount(target) {
    const id = getIdByTarget(target);
    $.ajax({
        url: '/rest/players/' + id,
        type: 'delete',
        success: function () {
            refreshTable();
        }
    });
}

function createAccount() {

    const name = document.getElementById('nameInputCreate');
    const title = document.getElementById('titleInputCreate');
    const race = document.getElementById('raceInputCreate');
    const profession = document.getElementById('professionInputCreate');
    const level = document.getElementById('levelInputCreate');
    const birthday = document.getElementById('birthdayInputCreate');
    let birthdayTimestamp = new Date(birthday.value).getTime();
    const banned = document.getElementById('bannedInputCreate');

    $.ajax({
        url: '/rest/players/',
        type: "POST",
        dataType: 'json',
        data: JSON.stringify({ name: name.value, title: title.value, race: race.value, profession: profession.value, level: level.value, birthday: birthdayTimestamp, banned: banned.value }),
        success: function () {
            refreshTable();

            name.value = "";
            title.value = "";
            race.value = getRaceArray()[0];
            profession.value = getProfessionArray()[0];
            level.value = "";
            birthday.value = "";
            banned.value = "false";
        }
    });
}

function populateSelect(select, options, innerHTML) {
    for (let i = 0; i < options.length; i++) {
        let option = document.createElement("OPTION");
        option.appendChild(document.createTextNode(options[i]));
        option.setAttribute("value", options[i]);
        if (innerHTML == options[i]) {
            option.setAttribute("selected", true);
        }
        select.appendChild(option);
    }
}

function getRaceArray(){
    return ['HUMAN', 'DWARF', 'ELF', 'GIANT', 'ORC', 'TROLL', 'HOBBIT'];
}
function getProfessionArray(){
    return ['WARRIOR', 'ROGUE', 'SORCERER', 'CLERIC', 'PALADIN', 'NAZGUL', 'WARLOCK', 'DRUID'];
}

function getIdByTarget(target) {
    return target.parentElement.parentElement.children.namedItem("id").innerHTML;
}

function getCountPerPage() {
    countPerPage = document.querySelector('#countPerPage');
    return countPerPage.value;
}

populateSelect(document.getElementById('raceInputCreate'), getRaceArray());
populateSelect(document.getElementById('professionInputCreate'), getProfessionArray());
populateSelect(document.getElementById('bannedInputCreate'), ['true', 'false'], 'false');

refreshTable();