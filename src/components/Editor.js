import React, { Component } from "react";
import _ from "lodash";
import { Input, Button, Alert, Modal, Tabs } from "antd";
import { saveAs } from "file-saver";
import {
  EDITABLE_VARIABLES_REGEX,
  EDITABLE_FUNCTIONS_REGEX
} from "../utils/constants";
const { TabPane } = Tabs;

export default class Editor extends Component {
  // TODO: spin this out into a route /editor/{simId}
  constructor(props) {
    super();
    this.state = this.setModalMeta(props.doc);
  }

  onChange = e => {
    const input = e.target.name.split("_");
    const type = input[0]; // functions / variables
    const name = input[1]; // functionName / variableName
    const currentTypeState = this.state[type];
    currentTypeState[name] = e.target.value; // note: do not mutate state directly
    this.setState(
      {
        [type]: currentTypeState
      },
      () => console.log(this.state[type])
    );
  };

  onSave = () => {
    // retrieve doc
    const { variables, functions } = this.state;
    var doc = this.state.doc;

    const variableNames = Object.keys(variables);
    const functionNames = Object.keys(functions);

    for (var i = 0; i < variableNames.length; i++) {
      const varName = variableNames[i];
      const value = variables[varName];
      if (!_.isUndefined(value)) {
        // search and replace
        console.log(
          `${EDITABLE_VARIABLES_REGEX.replace("[a-zA-Z0-9]+", varName)}`
        );
        var re = new RegExp(
          `${EDITABLE_VARIABLES_REGEX.replace("[a-zA-Z0-9]+", varName)}`
        ); // regex to search for variable name to be replaced in xhtml
        var res = doc.replace(re, `$1${value}$3$4`);
        doc = res;
      }
    }

    for (var i = 0; i < functionNames.length; i++) {
      const funcName = functionNames[i];
      const value = functions[funcName];
      if (!_.isUndefined(value)) {
        // search and replace
        var re = new RegExp(
          `${EDITABLE_FUNCTIONS_REGEX.replace(`[a-zA-Z]+`, funcName)}`
        ); // regex to search for function name to be replaced in xhtml
        let formattedString =
          "  " +
          JSON.stringify(value)
            .replace(/\\n/g, "\n ")
            .slice(1, -1)
            .replace(/\\"/g, '"');
        var res = doc.replace(re, `function $1$2${formattedString}\n$4`);
        doc = res;
      }
    }

    console.log(doc);

    this.setState({
      isSaved: true,
      doc: doc
    });
  };

  onOkEditor = () => {
    // this function replaces xhtml / index in zip file and preps for download
    const { doc } = this.state;
    const { zip, folderName } = this.props;

    const docBlob = new Blob([doc]);

    // just generate index.html - weehee, update old sims!
    zip.file(`index.html`, docBlob);

    // find name of file
    try {
      const name = zip.file(/^(\S+_Simulation\.xhtml)$/)[0].name;
      // rewrite Sim file
      zip.file(name, docBlob);
    } catch {
      // might not exist, grab name from ejss file.
      const name = zip.file(/^(\S+\.ejss)$/)[0].name;
      zip.file(`${name.split(".")[0]}_Simulation.xhtml`, docBlob);
    }

    zip.generateAsync({ type: "blob" }).then(blob => {
      saveAs(blob, `${folderName}`);
    });
  };

  setModalMeta(doc) {
    if (!_.isNull(doc)) {
      // parse html
      var title = doc.match(/<title>(.*?)<\/title>/)[1] || "undefined title";

      // look for variables
      var re = new RegExp(`${EDITABLE_VARIABLES_REGEX}`, "gm");

      var match,
        variables = {};

      // find variables and update state
      while ((match = re.exec(doc))) {
        let name = match[4];
        let value = match[2];
        if (!Object.keys(variables).includes(match[4])) {
          variables[name] = value;
        }
      }

      var re = new RegExp(`${EDITABLE_FUNCTIONS_REGEX}`, "gm");

      var match,
        functions = {};

      // find variables and update state
      while ((match = re.exec(doc))) {
        let name = match[1];
        let value = match[3];
        if (!Object.keys(functions).includes(name)) {
          functions[name] = value;
        }
      }

      return {
        variables: variables,
        functions: functions,
        title: title,
        doc: doc,
        isSaved: false
      };
    }
  }

  render() {
    const { variables, isSaved, title, functions } = this.state;
    const { toggleEditor, showEditor } = this.props;
    const disabledSave = _.isEmpty(variables);
    const disabledDownload = isSaved === false;
    return (
      <Modal
        title="Edit Model"
        visible={showEditor}
        okButtonProps={{ disabled: disabledDownload }}
        onOk={this.onOkEditor}
        onCancel={toggleEditor}
        okText="Download model"
      >
        {isSaved ? (
          <Alert
            style={{
              marginBottom: 10
            }}
            message="Model has been rewritten."
            type="success"
          />
        ) : null}
        <h2>{title}</h2>
        <Tabs
          defaultActiveKey="1"
          style={{
            maxHeight: 500,
            overflowY: `scroll`
          }}
        >
          <TabPane tab="Variables" key="1">
            {variables && Object.keys(variables).length > 0 ? (
              Object.keys(variables).map((name, i) => {
                let value = variables[name];
                return (
                  <div
                    style={{
                      marginBottom: 20
                    }}
                    key={i}
                  >
                    <code>{name}</code>
                    <Input
                      name={`variables_${name}`}
                      placeholder={value}
                      value={value}
                      onChange={this.onChange}
                    />
                  </div>
                );
              })
            ) : (
              <div>No editable variables found.</div>
            )}
          </TabPane>
          <TabPane tab="Functions" key="2">
            {functions && Object.keys(functions).length > 0
              ? Object.keys(functions).map((name, i) => {
                  let value = functions[name];
                  return (
                    <div
                      style={{
                        marginBottom: 20
                      }}
                      key={i}
                    >
                      <code>{`function ${name}() {`}</code>
                      <Input.TextArea
                        name={`functions_${name}`}
                        placeholder={value}
                        value={value}
                        onChange={this.onChange}
                      />
                      <code>{`}`}</code>
                    </div>
                  );
                })
              : "No functions to customize"}
          </TabPane>
        </Tabs>
        <Button
          style={{
            marginTop: 10
          }}
          disabled={disabledSave}
          onClick={this.onSave}
        >
          Save
        </Button>
      </Modal>
    );
  }
}
