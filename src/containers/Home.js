import React, { Component } from "react";
import _ from "lodash";
import { Input, Button, Spin, Card } from "antd";
import axios from "axios";
import Editor from "../components/Editor";
import JSZip from "jszip";

const { Meta } = Card;
export default class Home extends Component {
  constructor(props) {
    super();

    this.state = {
      url: "",
      isLoading: false,
      showEditor: false
    };
  }

  loadLibrary() {
    const baseUrl = `https://iwant2study.org/lookangejss/EditableSimulations/`;
    axios.get(baseUrl).then(res => {
      var match,
        results = [],
        libraryData = [];
      var re = new RegExp(`href="(ejss_model_(?:\\w+)\\.zip)"`, "gm");
      // find variables and update state
      while ((match = re.exec(res.data))) {
        if (!results.includes(match[1])) {
          results.push(match[1]);
        }
      }

      results.forEach((value, index, array) => {
        const fileUrl = baseUrl + value;
        axios
          .request({
            url: fileUrl,
            responseType: "arraybuffer",
            responseEncoding: null
          })
          .then(res => {
            var zip = new JSZip();
            zip.loadAsync(res.data).then(zip => {
              zip
                .file("_metadata.txt")
                .async("string")
                .then(s => {
                  const imageUrl = fileUrl.replace(
                    ".zip",
                    `/${s.match(/logo-image:\s(.+)\n/)[1]}`
                  );
                  const title = s.match(/title:\s(.+)\n/)[1];
                  const zipFile = res.data;
                  libraryData.push({
                    title,
                    imageUrl,
                    zipFile,
                    folderName: value
                  });
                  this.setState({
                    libraryData: libraryData
                  });
                });
            });
          });
      });
    });
  }

  unpackZipAndSetDoc = rawData => {
    var zip = new JSZip();
    zip
      .loadAsync(rawData)
      .then(zip => {
        /* check for valid document files 
        We check for *_Simulation.xhtml because of legacy reasons.
        index.html and *_Simulation.xhtml are identical.
        Therefore, we search for either and generate both to replace the existing files.
      */
        var xhtmlSimFile = zip.file(/^(\S+_Simulation\.xhtml)$/);
        if (xhtmlSimFile.length > 0) {
          xhtmlSimFile[0].async("string").then(s => {
            this.setState({
              doc: s
            });
          });
        } else {
          zip.file("index.html").then(s => {
            this.setState({
              doc: s
            });
          });
        }

        this.setState({
          isLoading: false,
          zip: zip
        });
      })
      .catch(e =>
        this.setState({
          isLoading: false,
          showError: true
        })
      );
  };

  onChange = e =>
    this.setState({
      [e.target.name]: e.target.value
    });

  onUpload = e => {
    var rawData = e.target.files[0];
    this.setState({
      isLoading: true,
      folderName: rawData.name
    });
    this.unpackZipAndSetDoc(rawData);
  };

  onSubmit = () => {
    this.setState({
      showEditor: true
    });
  };

  toggleEditor = () =>
    this.setState({
      showEditor: !this.state.showEditor,
      doc: null
    });

  componentWillMount() {
    this.loadLibrary();
  }

  render() {
    var {
      isLoading,
      showEditor,
      doc,
      showError,
      zip,
      folderName,
      libraryData
    } = this.state;
    const disabled = _.isNull(doc);
    const errorMessage = (
      <span style={{ color: `red` }}>Error retrieving source files.</span>
    );
    return (
      <div
        style={{
          display: `flex`,
          flexDirection: `column`,
          justifyContent: `center`,
          alignItems: `center`,
          padding: 10,
          height: `100%`
        }}
      >
        {/* TODO: move this into components */}
        <div
          style={{
            padding: 10,
            margin: 20
          }}
        >
          <h1>iwant2study Library</h1>
          <div
            style={{
              display: `flex`,
              flexDirection: `row`,
              overflowX: `scroll`
            }}
          >
            {libraryData
              ? libraryData.map((item, idx) => {
                  return (
                    <Card
                      key={idx}
                      hoverable={true}
                      bordered={true}
                      style={{
                        margin: 10,
                        padding: 10,
                        display: `flex`,
                        flexDirection: `column`,
                        alignItems: `center`,
                        width: 200,
                        height: 250
                      }}
                      onClick={() => {
                        this.unpackZipAndSetDoc(item.zipFile);
                        this.setState({
                          showEditor: true,
                          folderName: item.folderName
                        });
                      }}
                      cover={<img src={item.imageUrl} />}
                    >
                      <b>{item.title}</b>
                    </Card>
                  );
                })
              : null}
          </div>
        </div>

        <Spin spinning={isLoading}>
          <h1>EJSS Sim Editor</h1>
          <div
            style={{
              minWidth: 200,
              width: `50vw`
            }}
          >
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
              margin: 20
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
    );
  }
}
