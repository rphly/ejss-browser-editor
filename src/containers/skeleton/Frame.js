import React, { Component } from 'react'
import { Layout } from 'antd'
const { Header, Footer, Content } = Layout

export default class Frame extends Component {
    constructor(props) {
        super()
    }

    render() {
        return (
            <Layout style={{
                
            }}>
                <Header>Header</Header>
                <Content style={{
                    minHeight: `80vh`,
                    display: `flex`,
                    flexDirection: `column`,
                    justifyContent: `center`,
                    alignItems: `center`,
                    background: `white`
                }}>
                    {this.props.children}
                </Content>
                <Footer style={{
                    background: "white",
                    fontSize: 10
                }}>
                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/rphly/ejss-browser-editor">Contribute</a>
                </Footer>
            </Layout>
        )
    }
}