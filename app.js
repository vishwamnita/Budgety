// Budget Controller 
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    return {
        addItem: function(type, description, value) {
            var ID,newItem;

            // Create new ID
            if(data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else 
                ID = 0;
            // Create new Item
            if(type === 'exp')
                newItem = new Expense(ID, description, value);
            else if(type === 'inc')
                newItem = new Income(ID, description, value);

            // Push new Item onto the data Structure
            data.allItems[type].push(newItem);
            return newItem;
        },
        calculateBudget: function() {
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget which in income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calcute the percentage of income we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            }
            else {
                data.percentage = -1;
            }            

        },

        calculatePercentage: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPercentage = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPercentage;
        },


        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }    
        },


        deleteItem: function(type, id) {
            var ids,index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }           
        },


        testing: function() {
            console.log(data);
        }
    };

})();

// UIController 
var UIController = (function() {
    DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputAddBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        percentageContainer: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var splitNum,int,dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        splitNum = num.split(".");

        int = splitNum[0];
        dec = splitNum[1]; 

        if(int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length-3,3);
        }

        return (type === 'inc' ? '+ ' : '- ') + int + '.' + dec;
    };

    var nodeListForEach = function(items, callback){
        for(var i =0; i < items.length; ++i){
            callback(items[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: function(obj, type) {
            var html,newHtml,element;

            // Create HTML string with placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>  </div></div></div>';
            }
            else if(type === 'exp') {
                element = DOMstrings.expensesContainer;
                html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

            // Insert the actual data into DOM  
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        clearFields: function() {
            var fields,fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value= "";
            });
            
            fieldsArr[0].focus();
        },

        getDOMstrings: function() {
            return DOMstrings;
        },

        displayPercentages: function(percentages) {
            items = document.querySelectorAll(DOMstrings.percentageContainer);

            /*percentageItems = Array.prototype.slice.call(items);

            percentageItems.forEach(function(cur,index) {
                cur.textContent = percentages[index];
            });
            */

            

            nodeListForEach(items, function(current, index) {
                if(percentages[index] > 0){
                    current.textContent = percentages[index] +"%";
                }
                else{
                    current.textContent = "---";
                }
                
            });
        },

        displayBudget: function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,type);
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp,type);
            if(obj.totalInc > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        displayMonth: function() {
            var month,year,now,months;

            now = new Date();
            months = ['January','Februrary','March','April','May','June','July','August','September','October','November','December']
            year= now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            var fields;

            fields = document.querySelectorAll(
                DOMstrings.inputType + ', ' +
                DOMstrings.inputDescription + ', ' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputAddBtn).classList.toggle('red');            
        }
    };

})();

// Global Appelication Controller
var controller = (function(budgetCtrl, UICtrl) {

    var DOM = UICtrl.getDOMstrings();

    var setUpEventListeners = function() {

        document.querySelector(DOM.inputAddBtn).addEventListener('click', ctrlAddItem); 
    
        document.querySelector(DOM.inputAddBtn).addEventListener('click', ctrlAddItem); 
    
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);

    }

    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2.Return the budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }
    
    var updatePercentages = function() {
        // 1. Calculate the percentages
        budgetCtrl.calculatePercentage();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with new percentages
        UICtrl.displayPercentages(percentages);
    }
    var ctrlAddItem = function() {
        // 1. Get the field input data
        var input,newItem;
        
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value !== 0){
            // 2. Add the item to the Budget Controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem,input.type);

            // 4. Clear the fields in UI
            UICtrl.clearFields();

            // 5. Calculate and update the budget
            updateBudget();

            // 6. Update the percentage and display to UI
            updatePercentages();
        }       

    }

    var ctrlDeleteItem = function(event) {
        var itemID,splitID,ID,type;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Re-calculate the budget and display
            updateBudget();

            // 4. Update the percentage and display to UI
            updatePercentages();
        }     
    }
    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setUpEventListeners();
        }
    };
    

})(budgetController, UIController);

controller.init();