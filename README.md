EJSS Browser Editor
Deployment https://ejss-browser-editor.herokuapp.com/
EJSS Easy JavaScript Simulation authoring toolkit https://gitlab.com/ejsS/JavaScriptEditor/release try the latest version JavaScript_EJS_6.1%20BETA_201115.zip
more simulation can be found here https://iwant2study.org/ospsg/index.php/interactive-resources
But before the model.zip file can work there are a few things to configure

1. the Model - Variables - must rename the tab to be called EditableVariable
2. the Model - custom - must rename the tab to be called EditableFunction

this is because the current version looks for these 2 tabs to be parse as editable variables in the webeditor of EJSS.

If you want the files to be available on https://ejss-browser-editor.herokuapp.com/ as a selectable thumbnail model, it needs to be upload to https://iwant2study.org/lookangejss/EditableSimulations/ as the current version is looking for the models model here only instead of the entire directory https://iwant2study.org/lookangejss/
