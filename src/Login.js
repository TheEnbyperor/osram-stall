import React, {Component} from 'react';
import {Spinner, Textfield, Button} from 'react-mdl';
import {auth} from "./App";
import './Login.css';

export default class Login extends Component {
    state = {
        emailError: null,
        passwordError: null,
        loading: false,
    };


    componentDidMount() {
        this.setState({
            loading: true
        });
        auth.onAuthStateChanged(user => {
           if (!user) {
               this.setState({
                  loading: false
               });
           }
        });
    }

    login() {
        this.setState({
            loading: true
        });
        auth.signInWithEmailAndPassword(this.refs.email.inputRef.value, this.refs.password.inputRef.value)
            .catch(error => {
                if (error.code !== "auth/wrong-password") {
                    let message = "";
                    if (error.code === "auth/user-not-found") {
                        message = "User not found";
                    } else if (error.code === "auth/user-disabled") {
                        message = "User disabled";
                    } else {
                        message = "Invalid email";
                    }
                    this.setState({
                        emailError: message,
                        passwordError: null
                    });
                } else {
                    this.setState({
                        passwordError: "Invalid password",
                        emailError: null
                    });
                }
            });
    }

    render() {
        let main = null;
        if (this.state.loading) {
            main = (
                <div className="Login-spinner">
                    <Spinner/>
                </div>
            );
        } else {
            main = (
                <div className="Login-box">
                    <Textfield label="Email" error={this.state.emailError} floatingLabel ref="email"/><br/>
                    <Textfield label="Password" error={this.state.passwordError} floatingLabel inputClassName="password" ref="password"/><br/>
                    <Button raised ripple colored onClick={this.login.bind(this)}>Login</Button>
                </div>
            );
        }
        return (
            <div className="Login">
                <div className="Login-inner">
                    <h1>Bon app a ti</h1>
                    <h2>For stalls</h2>
                    {main}
                </div>
            </div>
        );
    }
}