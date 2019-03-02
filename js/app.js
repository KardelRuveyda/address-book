var AddressBook = AddressBook || {};

(function (app) {

    var _this = app;

    //Firebase

    const config = {
        apiKey: "AIzaSyABDUSakX9NTJnEFFpDsYAQ3r24pn9RZKk",
        authDomain: "addressbook-2a00e.firebaseapp.com",
        databaseURL: "https://addressbook-2a00e.firebaseio.com",
        projectId: "addressbook-2a00e",
        storageBucket: "addressbook-2a00e.appspot.com",
        messagingSenderId: "633801018869"
    };

    firebase.initializeApp(config);
    firebase.auth();

    const database = firebase.database();


    _this.selectors = {
        quickAddBtn: document.getElementById("QuickAdd"),
        cancelBtn: document.getElementById("Cancel"),
        AddBtn: document.getElementById("Add"),
        EditBtn: document.getElementById("Edit"),
        quickAddFormDiv: document.querySelector('.quickAddForm'),
        quickAddFormDivInput: document.querySelectorAll('.quickAddForm input'),
        addBookDiv: document.getElementById('address-book'),
        formFields: document.querySelectorAll(".formFields"),
        addressBook: document.getElementById("address-book"),
    };

    _this.$objs = {
        addressList: [],
        form: {},
        formArray: ['fullname', 'phone', 'email', 'address', 'city'],
        editFormId: null
    };

    _this.init = function () {


        // quick add form show hided
        _this.selectors.quickAddBtn.addEventListener("click", function () {
            _this.selectors.quickAddFormDiv.style.display = "block";
            _this.selectors.addBookDiv.style.display = "none";
            _this.selectors.EditBtn.style.display = "none";
            _this.selectors.AddBtn.style.display = "block";

            _this.clearForm();

        });

        /// edit button 

        _this.selectors.EditBtn.addEventListener("click", _this.updateToBook, function () {
            _this.selectors.quickAddFormDiv.style.display = "none";
            _this.updateToBook();
        });



        // save button
        _this.selectors.AddBtn.addEventListener("click", _this.addToBook, false);

        // cancel button
        _this.selectors.cancelBtn.addEventListener("click", function () {
            _this.selectors.quickAddFormDiv.style.display = "none";
            _this.selectors.addBookDiv.style.display = "block";
        });

        _this.formLoad();

        _this.getAddressList();
    }

    //Get AddressList

    _this.getAddressList = function () {
        database.ref('/addressList').once('value').then(function (snapshot) {
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    _this.$objs.addressList.push(child.val())
                    _this.selectors.addressBook.insertAdjacentHTML('beforeend', _this.generateListTemplate(child.val(), child.key))
                });

            }
        });
    }

    _this.formLoad = function () {

        let formArray = _this.$objs.formArray;

        formArray.forEach(item => {
            _this.selectors[item] = document.getElementById(item)
            _this.$objs.form[item] = null
        })

        _this.selectors.quickAddFormDivInput.forEach(input => {
            input.addEventListener('keyup', (e) => {
                _this.$objs.form[e.target.id] = e.target.value
            })
        })

    },


        _this.addToBook = function () {


            let form = {};

            if (_this.$objs.form.fullname) form.fullname = _this.$objs.form.fullname;
            if (_this.$objs.form.email) form.email = _this.$objs.form.email;
            if (_this.$objs.form.phone) form.phone = _this.$objs.form.phone;
            if (_this.$objs.form.address) form.address = _this.$objs.form.address;
            if (_this.$objs.form.city) form.city = _this.$objs.form.city;


            // address push

            database.ref('/addressList').push(form).then(function (res) {

                // address add
                _this.$objs.addressList.push(form)

                // generate html, insert address list
                _this.selectors.addressBook.insertAdjacentHTML('beforeend', _this.generateListTemplate(form, res.key))

                // Save to book clear form fields
                _this.selectors.addressBook.style.display = "block";

                _this.clearForm();

                _this.selectors.quickAddFormDiv.style.display = "none";
            });

        };


    //updateToBook

    _this.updateToBook = function () {

        _this.$objs.form = {};

        let formArray = _this.$objs.formArray;

        formArray.forEach((item) => {
            _this.$objs.form[item] = document.getElementById(item).value
        })


        database.ref().child('/addressList/' + _this.$objs.editFormId).update(_this.$objs.form, function () {

            document.querySelector('.entry-' + _this.$objs.editFormId).outerHTML = _this.generateListTemplate(_this.$objs.form, _this.$objs.editFormId)

            // Save to book clear form fields
            _this.selectors.addressBook.style.display = "block";

            _this.clearForm();

            _this.selectors.quickAddFormDiv.style.display = "none";

        });

    };
 //


    _this.generateListTemplate = function (obj, id) {

        adressBookTemplate = `<div class="entry entry-${id}">
                                <div class="name"><p>${obj.fullname}</p></div>
                                <div class="email"><p>${obj.email}</p></div>
                                <div class="phone"><p>${obj.phone}</p></div>
                                <div class="address"><p>${obj.address}</p></div>
                                <div class="city"><p>${obj.city}</p></div>
                                <div class="del"><a href="javascript:;" class="delbutton" onclick="AddressBook.removeAddress('${id}')">Sil</a></div>
                                <div class="update"><a href="javascript:;" class="updatebutton" onclick="AddressBook.updateAddress('${id}')">Düzenle</a></div>
                             </div>`;

        return adressBookTemplate;
    }

    //Clean Form
    _this.clearForm = function () {

        let formArray = _this.$objs.formArray;

        formArray.forEach((item, index) => {
            _this.selectors.formFields[index].value = '';
            _this.$objs.form[item] = null
        })

    };

    // Update Form

    _this.updateForm = function (obj) {

        _this.clearForm();

        Object.keys(obj).forEach(function (key) {
            document.getElementById(key).value = obj[key]
        });
    };

    // Delete 

    _this.removeAddress = function (id) {
        database.ref().child('/addressList/' + id).remove();
        document.querySelector('.entry-' + id).remove()
    }

    //Düzenle

    _this.updateAddress = function (id) {

        database.ref().child('/addressList/' + id).once('value').then(function (snapshot) {
            _this.selectors.quickAddFormDiv.style.display = "block";
            _this.selectors.addBookDiv.style.display = "none";
            _this.selectors.EditBtn.style.display = "block";
            _this.selectors.AddBtn.style.display = "none";
            _this.updateForm(snapshot.val());
            _this.$objs.editFormId = id;
        })
    }


})(AddressBook);


AddressBook.init();