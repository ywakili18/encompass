Encompass.UserNewAdminComponent = Ember.Component.extend(Encompass.CurrentUserMixin, {
  elementId: 'user-new-admin',
  usernameExists: null,
  emailExistsError: null,
  errorMessage: null,
  username: '',
  password: '',
  name: '',
  email: '',
  org: null,
  location: '',
  accountTypes: ['Teacher', 'Student', 'Pd Admin', 'Admin'],
  isAuthorized: null,
  authorizedBy: '',
  newUserData: {},
  actingRole: null,

  createNewUser: function (data) {
    return new Promise((resolve, reject) => {
      if (!data) {
        return reject('Invalid data');
      }
      Ember.$.post({
          url: '/auth/signup',
          data: data
        })
        .then((res) => {
          return resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  handleOrg: function (org) {
    var that = this;
    return new Promise((resolve, reject) => {
      if (!org) {
        return reject('Invalid Data');
      }
      if (typeof org === 'string') {
        let rec = that.store.createRecord('organization', {
          name: org
        });

        rec.save()
          .then((res) => {
            console.log('res', res);
            return resolve(res.get('organizationId'));
          })
          .catch((err) => {
            return reject(err);
          });
      } else {
        return resolve(org.get('organizationId'));
      }

    });
  },

  actions: {
    newUser: function () {
      var username = this.get('username');
      var password = this.get('password');
      var name = this.get('name');
      var email = this.get('email');
      var organization = this.get('org');
      var location = this.get('location');
      var accountType = this.get('selectedType');
      var accountTypeLetter = accountType.charAt(0).toUpperCase();
      var isAuthorized = this.get('isAuthorized');
      var currentUserId = this.get('currentUser').get('id');


      if (!username || !password || !organization || !accountType) {
        this.set('errorMessage', true);
        return;
      }

      if (accountTypeLetter !== "S") {
        this.set('actingRole', 'teacher');
        if (!email) {
          this.set('errorMessage', true);
          return;
        }
      } else {
        email = null;
      }

      if (isAuthorized) {
        let userData = {
          username: username,
          password: password,
          name: name,
          email: email,
          location: location,
          accountType: accountTypeLetter,
          isAuthorized: true,
          authorizedBy: currentUserId,
          createdBy: currentUserId,
          createDate: new Date(),
          actingRole: this.get('actingRole'),
        };
        this.set('authorizedBy', currentUserId);
        this.set('newUserData', userData);
      } else {
        let userData = {
          username: username,
          password: password,
          name: name,
          email: email,
          location: location,
          accountType: accountTypeLetter,
          isAuthorized: false,
          createdBy: currentUserId,
          createDate: new Date(),
          actingRole: this.get('actingRole'),
        };
        this.set('newUserData', userData);
      }

      if (!username) {
        return;
      }

      return this.handleOrg(organization)
        .then((org) => {
          let newUserData = this.get('newUserData');
          newUserData.organization = org;
          return this.createNewUser(newUserData)
            .then((res) => {
              if (res.message === 'Can add existing user') {
                this.set('usernameExists', true);
                return;
              } else if (res.message === 'There already exists a user with that email address.') {
                this.set('emailExistsError', res.message);
                return;
              } else {
                console.log('success new user username', res.username);
                this.sendAction('toUserInfo', res.username);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    },

    usernameValidate() {
      var username = this.get('username');
      if (username) {
        var usernamePattern = new RegExp(/^[a-z0-9.\-_@]{3,64}$/);
        var usernameTest = usernamePattern.test(username);

        if (usernameTest === false) {
          this.set('incorrectUsername', true);
          return;
        }

        if (usernameTest === true) {
          this.set('incorrectUsername', false);
          this.set('missingCredentials', false);
          return;
        }
      }
    },

    emailValidate: function () {
      var email = this.get('email');
      if (!email) {
        return false;
      }
      var emailPattern = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);
      var emailTest = emailPattern.test(email);

      if (emailTest === false) {
        this.set('incorrectEmail', true);
        return false;
      }

      if (emailTest === true) {
        this.set('incorrectEmail', false);
        return true;
      }
    },

    passwordValidate: function () {
      var password = this.get('password');

      function hasWhiteSpace(string) {
        return /\s/g.test(string);
      }

      if (password.length < 3) {
        this.set('invalidPassword', true);
      } else {
        this.set('invalidPassword', false);
      }

      if (hasWhiteSpace(password)) {
        this.set('noSpacesError', true);
      } else {
        this.set('noSpacesError', false);
      }

    },

    cancelNew: function () {
      this.sendAction('toUserHome');
    },

    resetErrors(e) {
      const errors = ['usernameExists', 'emailExistsError', 'errorMessage'];

      for (let error of errors) {
        if (this.get(error)) {
          this.set(error, false);
        }
      }
    },
  }
});
