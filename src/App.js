import React, {Component} from 'react';
import 'react-mdl/extra/material.js';
import {Snackbar, Layout, Header, HeaderRow, Tab, Content, HeaderTabs, Drawer} from 'react-mdl';
import firebase from 'firebase';
import 'react-mdl/extra/material.css';
import './Login';
import './App.css';
import Login from "./Login";
import Orders from "./Orders";

// Initialize Firebase
const config = {
    apiKey: "AIzaSyBAIHhafMkp19JTovzUxYuoYNBxo-qPzaQ",
    authDomain: "bon-app-a-ti.firebaseapp.com",
    databaseURL: "https://bon-app-a-ti.firebaseio.com",
    projectId: "bon-app-a-ti",
    storageBucket: "bon-app-a-ti.appspot.com",
    messagingSenderId: "683254335656"
};
firebase.initializeApp(config);
export const auth = firebase.auth();
export const database = firebase.database();
export const messaging = firebase.messaging();

class App extends Component {
    uid = 0;
    state = {
        curMsg: '',
        isSnackbarActive: false,
        signedIn: false,
        stallId: 0,
    };

    componentDidMount() {
        const self = this;
        auth.onAuthStateChanged(user => {
            if (user) {
                self.uid = user.uid;
                self.setState({
                    signedIn: true
                });
                database.ref('stalls').orderByChild('owner').equalTo(user.uid).on('child_added', (data) => {
                    this.setState({
                        stallId: data.key
                    });
                });
            } else {
                self.uid = 0;
                self.setState({
                    signedIn: false
                });
            }
            messaging.requestPermission()
                .then(function () {
                    console.log('Notification permission granted.');
                    messaging.getToken()
                        .then(currentToken => {
                            if (currentToken) {
                                // console.log(currentToken);
                            } else {
                                // Show permission request.
                                console.log('No Instance ID token available. Request permission to generate one.');
                            }
                        })
                        .catch(err => {
                            console.log('An error occurred while retrieving token. ', err);
                        });
                }).catch(err => {
                console.log('Unable to get permission to notify.', err);
            });
        });
        // messaging.onMessage(payload => {
        //     console.log("Message received. ", payload);
        // });
    }

    showMessage(msg) {
        this.setState({
            curMsg: msg,
            isSnackbarActive: true
        });
    }

    handleTimeoutSnackbar() {
        this.setState({
            isSnackbarActive: false
        });
    }

    render() {
        let main = null;
        if (this.state.signedIn) {
            main = (
                <Layout fixedHeader fixedTabs>
                    <Header waterfall hideSpacer hideTop>
                        <HeaderTabs ripple activeTab={0} onChange={(tabId) => {
                        }}>
                            <Tab>Orders</Tab>
                            <Tab>Edit Menu</Tab>
                        </HeaderTabs>
                    </Header>
                    <Content>
                        <div className="page-content">
                            <Orders stallId={this.state.stallId}/>
                        </div>
                    </Content>
                </Layout>);
        } else {
            main = <Login/>;
        }

        return (
            <div className="App">
                {main}
                <Snackbar
                    ref="snackbar"
                    active={this.state.isSnackbarActive}
                    onTimeout={this.handleTimeoutSnackbar.bind(this)}>
                    {this.state.curMsg}
                </Snackbar>
            </div>
        );
    }
}

export default App;
