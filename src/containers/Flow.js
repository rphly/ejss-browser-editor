import React, { Component } from 'react'
import _ from 'lodash'
import { Input, Button, Spin, Modal } from 'antd'
import axios from 'axios'
import Editor from '../components/Editor'

export default class Flow extends Component {
	constructor(props) {
		super()

		this.state = {
			url: "",
			isLoading: false,
			showEditor: false,
		}
	}

	onChange = (e) => (
		this.setState({
			[e.target.name]: e.target.value
		})
	)

	onSubmit = () => {
		this.setState({
			isLoading:true
		})

		axios.get(
			this.state.url,
		)
		.then((res) => {
			if (res.headers["content-type"] === "text/html") {
				this.setState({
					isLoading: false,
					showEditor: true,
					doc: res.data
				})
			} else {
				
			}
		})
		.catch((e) => {
			this.setState({
				isLoading: false,
			})
		})
	}

	toggleEditor = () => (
		this.setState({
			showEditor: !this.state.showEditor,
			doc: null
		})
	)

	render() {
		var { url, isLoading, showEditor, doc } = this.state
		const disabled = _.isEmpty(url)
		console.log(doc)
		return (
			<div style={{
				display: `flex`,
				flexDirection: `column`,
				justifyContent: `center`,
				alignItems: `center`,
				padding: 10,
				height: `100%`,
				
			}}>
				<Spin
					spinning={isLoading}
				>
					<h1>EJSS Sim Editor</h1>
					<div style={{
						minWidth: 200,
						width: `50vw`
					}}>
						<Input 
							name="url"
							onChange={this.onChange}
							placeholder={`Insert url here`}
							value={url}
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

					{doc ? 
						<Editor 
							showEditor={showEditor} 
							toggleEditor={this.toggleEditor}
							doc={doc}
						/> : null}

				</Spin>
			</div>
		);
	}
}