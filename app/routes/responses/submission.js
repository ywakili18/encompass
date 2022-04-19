import { resolve, hash } from 'rsvp';
import { inject as service } from '@ember/service';
import AuthenticatedRoute from '../_authenticated_route';
import Ember from 'ember';
import { action } from '@ember/object';
export default class ResponsesRoute extends AuthenticatedRoute {
  @service('utility-methods') utils;
  @service store;
  queryParams = {
    responseId: {
      refreshModel: true,
    },
  };

  beforeModel(transition) {
    let responseId;
    if (transition.intent.queryParams) {
      responseId = transition.intent.queryParams.responseId;
    }
    let allResponses = this.store.peekAll('response');

    if (this.utils.isValidMongoId(responseId)) {
      let response = allResponses.findBy('id', responseId);

      this.response = response;
    } else {
      this.response = null;
    }
  }
  resolveSubmission(submissionId) {
    let peeked = this.store.peekRecord('submission', submissionId);
    if (peeked) {
      return resolve(peeked);
    }
    return this.store.findRecord('submission', submissionId);
  }

  resolveWorkspace(workspaceId) {
    let peeked = this.store.peekRecord('workspace', workspaceId);
    if (peeked) {
      return resolve(peeked);
    }
    return this.store.findRecord('workspace', workspaceId);
  }

  async model(params) {
    if (!params.submission_id) {
      return null;
    }

    let allResponses = await this.store.peekAll('response');

    return this.resolveSubmission(params.submission_id)
      .then((submission) => {
        let wsIds = submission.hasMany('workspaces').ids();
        let wsId = wsIds.get('firstObject');
        return hash({
          submission,
          workspace: this.resolveWorkspace(wsId),
        });
      })
      .then((hash) => {
        return Ember.RSVP.hash({
          submission: hash.submission,
          workspace: hash.workspace,
          submissions: hash.workspace.get('submissions'),
          responses: hash.workspace.get('responses'),
        });
      })
      .then((hash) => {
        let studentSubmissions = hash.submissions.filterBy(
          'student',
          hash.submission.get('student')
        );
        let associatedResponses = hash.responses.filterBy('id').sort();
        let response = this.response;
        if (!this.response) {
          response = associatedResponses
            .filterBy('responseType', 'mentor')
            .sortBy('createDate')
            .get('lastObject');
        }
        if (params.responseId) {
          response = this.store.findRecord('response', params.responseId);
        }

        return {
          submission: hash.submission,
          workspace: hash.workspace,
          submissions: studentSubmissions,
          responses: associatedResponses,
          response: response,
          allResponses,
        };
      });
  }

  redirect(model, transition) {
    if (!model) {
      this.transitionTo('responses');
    }
  }

  @action toResponseSubmission(subId) {
    this.transitionTo('responses.submission', subId);
  }
  @action toResponse(submissionId, responseId) {
    this.transitionTo('responses.submission', submissionId, {
      queryParams: { responseId: responseId },
    });
  }
  @action toResponses() {
    this.transitionTo('responses');
  }
  @action toNewResponse(submissionId, workspaceId) {
    this.transitionTo('responses.new.submission', submissionId, {
      queryParams: { workspaceId: workspaceId },
    });
  }

  @action renderTemplate() {
    this.render('responses/response');
  }
}
