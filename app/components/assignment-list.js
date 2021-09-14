import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  utils: service('utility-methods'),

  didReceiveAttrs: function () {
    this._super();
    // this.filterAssignments();
  },

  // filterAssignments: observer(
  //   'assignments.@each.isTrashed',
  //   'currentUser.isStudent',
  //   function () {
  //     let currentUser = this.currentUser;
  //     let filtered = this.assignments.filter((assignment) => {
  //       return assignment.id && !assignment.get('isTrashed');
  //     });
  //     filtered = filtered.sortBy('createDate').reverse();
  //     this.set('assignmentList', filtered);
  //   }
  // ),

  yourList: computed(
    'assignments.@each.isTrashed',
    'currentUser.isStudent',
    function () {
      let currentUser = this.currentUser;
      let yourList = this.assignments.filter((assignment) => {
        let userId = currentUser.get('id');
        let assigmentCreatorId = this.utils.getBelongsToId(
          assignment,
          'createdBy'
        );
        return userId === assigmentCreatorId && !assignment.get('isTrashed');
      });
      return yourList.sortBy('createDate').reverse();
    }
  ),

  adminList: computed(
    'assignmentList',
    'assignments.@each.isTrashed',
    'currentUser.isStudent',
    function () {
      let currentUser = this.currentUser;
      let adminList = this.assignmentList.filter((assignment) => {
        let userId = currentUser.get('id');
        let assigmentCreatorId = this.utils.getBelongsToId(
          assignment,
          'createdBy'
        );
        return userId !== assigmentCreatorId && !assignment.get('isTrashed');
      });
      return adminList.sortBy('createDate').reverse();
    }
  ),

  pdList: computed(
    'assignmentList',
    'assignments.@each.isTrashed',
    'currentUser.isStudent',
    function () {
      let currentUser = this.currentUser;
      let pdList = this.assignmentList.filter((assignment) => {
        let userId = currentUser.get('id');
        let assigmentCreatorId = this.utils.getBelongsToId(
          assignment,
          'createdBy'
        );
        return userId !== assigmentCreatorId && !assignment.get('isTrashed');
      });
      return pdList.sortBy('createDate').reverse();
    }
  ),
});
