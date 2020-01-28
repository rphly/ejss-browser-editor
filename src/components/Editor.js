import React, { Component } from 'react'
import _ from 'lodash'
import { Input, Button, Alert, Modal } from 'antd'

export default class Editor extends Component {
  constructor(props) {
    super()
    this.state = this.setModalMeta(props.doc)
  }

  onChange = e => {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  onSave = () => {
    // retrieve doc
    const { variables } = this.state
    var doc = this.state.doc
    for (var i = 0; i < variables.length; i++) {
      const varName = variables[i]
      const value = this.state[`variable_${varName}`]
      if (!_.isUndefined(value)) {
        // search and replace
        var re = new RegExp(
          `(${varName}\\s=\\s)([a-zA-Z0-9]+)(;\\s\\/\\/\\sEjsS\\sModel\\.Variables\\.teachereditsanswershere)`
        ) // regex to search for variable name to be replaced in xhtml
        var res = doc.replace(re, `$1${value}$3`)
        doc = res
      }
    }
    this.setState({
      isSaved: true,
      doc: doc,
    })
  }

  onOkEditor = () => {
    // download html
    const { doc } = this.state
    console.log('Download document')
    const url = window.URL.createObjectURL(new Blob([doc]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'index.html')
    document.body.appendChild(link)
    link.click()

    this.props.toggleEditor()
  }

  setModalMeta(doc) {
    if (!_.isNull(doc)) {
      // parse html
      var title = doc.match(/<title>(.*?)<\/title>/)[1] || 'undefined title'

      // look for variables
      var re = /\/\/\sEjsS\sModel\.Variables\.teachereditsanswershere.(\S+)/gm
      var match,
        results = []

      // find variables and update state
      while ((match = re.exec(doc))) {
        if (!results.includes(match[1])) {
          results.push(match[1])
        }
      }

      return {
        variables: results,
        title: title,
        doc: doc,
        isSaved: false,
      }
    }
  }

  componentWillReceiveProps() {
    this.setModalMeta(this.props.doc)
  }

  render() {
    const { variables, isSaved, title } = this.state
    const { toggleEditor, showEditor } = this.props
    const disabled = _.isEmpty(variables)
    return (
      <Modal
        title="Edit variables"
        visible={showEditor}
        onOk={this.onOkEditor}
        onCancel={toggleEditor}
        okText="Download model"
      >
        {isSaved ? (
          <Alert
            style={{
              marginBottom: 10,
            }}
            message="Variables have been rewritten."
            type="success"
          />
        ) : null}

        <h2>{title}</h2>

        {variables && variables.length > 0 ? (
          variables.map((v, i) => {
            return (
              <div
                style={{
                  marginBottom: 20,
                }}
                key={i}
              >
                <code>{v}</code>
                <Input
                  name={`variable_${v}`}
                  value={this.state[`variable_${v}`]}
                  onChange={this.onChange}
                />
              </div>
            )
          })
        ) : (
          <div>No editable variables found.</div>
        )}
        <Button
          style={{
            marginTop: 10,
          }}
          disabled={disabled}
          onClick={this.onSave}
        >
          Save
        </Button>
      </Modal>
    )
  }
}
