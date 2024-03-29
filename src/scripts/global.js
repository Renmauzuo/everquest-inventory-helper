let inventoryLoaded = false;
let guideLoaded = false;
let inventoryReader;
let guideReader;
let inventoryObjects;
let guideDictionary;

$(function () {
    inventoryReader = new FileReader();
    inventoryReader.onload = onInventoryLoad;
    guideReader = new FileReader();
    guideReader.onload = onGuideLoad;

    $('input[type=checkbox]').on('change', function () {
        if (inventoryLoaded && guideLoaded) {
            parseInventory();
        }
    });

    $('#inventory').on('change', function () {
       let file = $(this).prop('files')[0];
       inventoryReader.readAsText(file);
    });

    $('#sort-guide').on('change', function () {
        let file = $(this).prop('files')[0];
        guideReader.readAsText(file);
    });

    $('th').on('click', function () {
        sortTable($(this).index());
    });

    
    if (localStorage['theme']) {
        $('#theme').val(localStorage['theme']);
        updateTheme();
    }
    $('#theme').on('change', function () {
        localStorage['theme'] = $(this).val();  
        updateTheme();
    });

    function updateTheme() {
        $('body').removeClass(); 
        switch ($('#theme').val()) {
            case '1':
                $('body').addClass('light');
                break;
            case '2':
                $('body').addClass('dark');
                break;
        }
    }

});

function onInventoryLoad() {
    //Convert to csv format by replacing tabs with commas
    let inventoryCSV = inventoryReader.result.replace(/\t/g, ",");
    inventoryObjects = $.csv.toObjects(inventoryCSV);

    inventoryLoaded = true;
    if (guideLoaded) {
        parseInventory();
    }
}

function onGuideLoad() {
    let guideCSV = guideReader.result;
    let guideObjects = $.csv.toObjects(guideCSV);
    guideDictionary = {};
    for (let i = 0; i < guideObjects.length; i++) {
        let currentDictionary = {};
        currentDictionary.Use = guideObjects[i].Use;
        currentDictionary.Notes = guideObjects[i].Notes;
        guideDictionary[guideObjects[i].Item] = currentDictionary;
    }

    guideLoaded = true;
    if (inventoryLoaded) {
        parseInventory();
    }
}

function parseInventory() {
    let tbody = $('#full-item-list tbody');
    tbody.empty();

    for (let i = 0; i < inventoryObjects.length; i++) {
        let currentItem = inventoryObjects[i];
        //Always check general items and never check equipment
        //Check bank and shared bank conditionally if they are checked
        if (currentItem.Name !== 'Empty' && (currentItem.Location.startsWith('General') || ($('#bank:checked').length && currentItem.Location.startsWith('Bank')) || ($('#shared-bank:checked').length) && currentItem.Location.startsWith('SharedBank')) || ($('#depot:checked').length && currentItem.Location.startsWith('Personal-Depot'))) {
            let currentDictionary = guideDictionary[currentItem.ID] || guideDictionary[currentItem.Name] || {};
            let itemUse = currentDictionary.Use || "No use set";

            if (itemUse !== 'Ignore' && ($('#include-unset:checked').length || itemUse !== "No use set")) {
                let tr = $('<tr></tr>');
                tr.append('<td>'+currentItem.Name+'</td>');
                tr.append('<td>'+itemUse+'</td>');
                tr.append('<td>'+currentItem.Location+'</td>');
                tr.append('<td>'+(currentDictionary.Notes||'')+'</td>');
                tbody.append(tr);
            }
        }
    }

    $('#full-item-list').show();
}

function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("item-table");
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 1; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        /* Check if the two rows should switch place,
        based on the direction, asc or desc: */
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        // Each time a switch is done, increase this count by 1:
        switchcount ++;
      } else {
        /* If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again. */
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }