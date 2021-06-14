Encompass.SectionRoute = Encompass.AuthenticatedRoute.extend({
  model: function (params) {
    var section = this.get('store').findRecord('section', params.sectionId);
    return section;
  },

  actions: {
    toSectionList: function () {
      this.transitionTo('sections');
    },
    toAssignmentInfo: function (assignment) {
      this.transitionTo('assignment', assignment);
    }
  }
});
