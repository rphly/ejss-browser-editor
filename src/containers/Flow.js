import React, { Component } from 'react'
import _ from 'lodash'
import { Input, Button, Spin, Upload, Icon, message } from 'antd'
import axios from 'axios'
import Editor from '../components/Editor'
import JSZip from "jszip"

export default class Flow extends Component {
  constructor(props) {
    super()

    this.state = {
      url: '',
      isLoading: false,
      showEditor: false,
    }
  }

  onChange = e =>
    this.setState({
      [e.target.name]: e.target.value,
    })

  onUpload = (e) => {
    var rawData = e.target.files[0]
    this.setState({
      isLoading: true,
      folderName: rawData.name
    })
    var zip = new JSZip();
    zip.loadAsync(rawData)
    .then((zip) => {
      /* check for valid document files 
        We check for *_Simulation.xhtml because of legacy reasons.
        index.html and *_Simulation.xhtml are identical.
        Therefore, we search for either and generate both to replace the existing files.
      */
      var xhtmlSimFile = zip.file(/^(\S+_Simulation\.xhtml)$/)
      if (xhtmlSimFile.length > 0) {
        console.log("simxHtml found")
        console.log(xhtmlSimFile)
        xhtmlSimFile[0].async("string").then((s) => {
          this.setState({
            doc: s
          })
        })
      } else {
        console.log("simxHtml not found... checking for index.html")
        zip.file("index.html").then((s) => {
          console.log("index.html found")
          this.setState({
            doc: s
          })
        })
      }

      this.setState({
        isLoading: false,
        zip: zip
      })
    })
    .catch( e => (
      this.setState({
        isLoading: false,
        showError: true
      })
    )) 
  }

  onSubmit = () => {
    this.setState({
      showEditor: true,
    })
  }

  toggleEditor = () =>
    this.setState({
      showEditor: !this.state.showEditor,
      doc: null,
    })

  render() {
    var { isLoading, showEditor, doc, showError, zip, folderName } = this.state
    const disabled = _.isNull(doc)
    const errorMessage = <span style={{color: `red`}}>Error retrieving source files.</span>
    return (
      <div
        style={{
          display: `flex`,
          flexDirection: `column`,
          justifyContent: `center`,
          alignItems: `center`,
          padding: 10,
          height: `100%`,
        }}
      >
        <Spin spinning={isLoading}>
          <h1>EJSS Sim Editor</h1>
          <div
            style={{
              minWidth: 200,
              width: `50vw`,
            }}
          >
            {/* <Input
              name="url"
              onChange={this.onChange}
              placeholder={`Insert url here`}
              value={url}
              autoComplete="off"
            />
            */}
            {showError ? errorMessage : null}

            <Input 
              style={{
                marginTop: 20
              }}
              type="file"
              accept=".zip"
              onChange={this.onUpload.bind(this)}
            />
          </div>

          <Button
            style={{
              margin: 20,
            }}
            onClick={this.onSubmit}
            disabled={disabled}
          >
            Get Model
          </Button>

          {doc ? (
            <Editor
              showEditor={showEditor}
              toggleEditor={this.toggleEditor}
              doc={doc}
              zip={zip}
              folderName={folderName}
            />
          ) : null}
        </Spin>
      </div>
    )
  }
}