Encompass.Problem = DS.Model.extend(Encompass.Auditable, {
  problemId: Ember.computed.alias('id'),
  title: DS.attr('string'),
  puzzleId: DS.attr('number'),
  text: DS.attr('string'),
  imageUrl: DS.attr('string'),
  sourceUrl: DS.attr('string'),
  image: DS.belongsTo('image', { inverse: null} ),
  origin: DS.belongsTo('problem', { inverse: null }),
  modifiedBy: DS.belongsTo('user', { inverse: null }),
  organization: DS.belongsTo('organization', { inverse: null }),
  additionalInfo: DS.attr('string'),
  privacySetting: DS.attr('string'),
  // isPublic: DS.attr('boolean'),
// categories: DS.hasMany('category', {
//     async: true
  // }),
});

/*
  Categories is commented out because the backend model is currently
  expecting an array of category ids which we do not have yet
*/