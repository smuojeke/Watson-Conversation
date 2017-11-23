const bodyParser = require('body-parser');
const conversation = require('./../services/service-manager').get('watson-conversation');

let workspaceId = process.env.WORKSPACE_ID || '<workspace-id>';

module.exports = function(app) {
  app.use(bodyParser.json());

  /**
   * Endpoint to be call from the client side
   */
  app.post('/api/message', function(req, res) {
    if (!workspaceId || workspaceId === '<workspace-id>') {
      return res.json({
        output: {
          text: 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the Application Checklist in the Watson Console documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from the training file (<code>training/car_workspace.json</code>) in order to get a working application.'
        }
      });
    }
    var payload = {
      workspace_id: workspaceId,
      context: req.body.context || {},
      input: req.body.input || {}
    };

    // Send the input to the conversation service
    conversation.message(payload, function(err, data) {
      if (err) {
        return res.status(err.code || 500).json(err);
      }
      return res.json(data);
    });
  });
}

/**
 * Creates a workspace or use an existing one
*/
conversation.listWorkspaces(function(err, response) {
  if (err) {
    return;
  } else if (response.workspaces.length > 0) {
    workspaceId = response.workspaces[0].workspace_id;
  } else {
    console.log('creating a workspace...');
    conversation.createWorkspace(require('../../training/car_training.json'), function(err, response) {
      if (!err) {
        workspaceId = response.workspace_id;
      }
    });
  }
});
