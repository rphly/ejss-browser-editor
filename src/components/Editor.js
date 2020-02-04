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
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  onSave = () => {
    // retrieve doc
    const { variables, functions } = this.state;
    var doc = this.state.doc;
    for (var i = 0; i < variables.length; i++) {
      const varName = variables[i].name;
      const value = this.state[`variable_${varName}`];
      if (!_.isUndefined(value)) {
        // search and replace
        var re = new RegExp(
          `${EDITABLE_VARIABLES_REGEX.replace("[a-zA-Z]+", varName)}`
        ); // regex to search for variable name to be replaced in xhtml
        var res = doc.replace(re, `$1${value}$3$4`);
        doc = res;
      }
    }

    for (var i = 0; i < functions.length; i++) {
      const funcName = functions[i].name;
      const value = this.state[`function_${funcName}`];
      if (!_.isUndefined(value)) {
        console.log(`${value}`);
        // search and replace
        var re = new RegExp(
          `${EDITABLE_FUNCTIONS_REGEX.replace(`[a-zA-Z]+`, funcName)}`
        ); // regex to search for function name to be replaced in xhtml
        var res = doc.replace(
          re,
          `function $1$2 ${JSON.stringify(value)
            .replace(/\\n/g, "\n ")
            .slice(1, -1)}\n$4`
        );
        doc = res;
      }
    }

    this.setState({
      isSaved: true,
      doc: doc
    });
    console.log(doc);
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
        variables = [];

      console.log(doc);

      // find variables and update state
      while ((match = re.exec(doc))) {
        console.log(match);
        if (!variables.includes(match[4])) {
          const variable = {
            name: match[4],
            value: match[2]
          };
          variables.push(variable);
        }
      }

      var re = new RegExp(`${EDITABLE_FUNCTIONS_REGEX}`, "gm");

      var match,
        functions = [];

      // find variables and update state
      while ((match = re.exec(doc))) {
        console.log(match);
        if (!functions.includes(match[1])) {
          const func = {
            name: match[1],
            body: match[3]
          };
          functions.push(func);
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

  componentWillReceiveProps() {
    this.setModalMeta(this.props.doc);
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
            message="Variables have been rewritten."
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
            {variables && variables.length > 0 ? (
              variables.map((v, i) => {
                return (
                  <div
                    style={{
                      marginBottom: 20
                    }}
                    key={i}
                  >
                    <code>{v.name}</code>
                    <Input
                      name={`variable_${v.name}`}
                      placeholder={`${v.value}`}
                      value={this.state[`variable_${v.name}`]}
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
            {functions && functions.length > 0
              ? functions.map((f, i) => {
                  return (
                    <div
                      style={{
                        marginBottom: 20
                      }}
                      key={i}
                    >
                      <code>{`function ${f.name}() {`}</code>
                      <Input.TextArea
                        name={`function_${f.name}`}
                        placeholder={`${f.body}`}
                        value={this.state[`function_${f.name}`]}
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
