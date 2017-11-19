import React, {Component} from 'react';
import dialogPolyfill from 'dialog-polyfill';
import { findDOMNode } from 'react-dom';
import {Card, CardActions, CardText, Dialog, DialogTitle, DialogContent, DialogActions, DataTable, TableHeader,
    Textfield, Button} from 'react-mdl';
import {database} from "./App";
import './Orders.css';

class PendingOrder extends Component {
    state = {
        orderData: [],
        openDialog: false,
        rejectReasonError: null,
    };

    getOrder(orderId) {
        database.ref(`pendingOrders/${orderId}`).on('value', data => {
                let orderData = [];
                data.child('cart').forEach(item => {
                    database.ref('menu/' + data.child('stall').val() + '/' + item.key).once('value')
                        .then(itemData => {
                            orderData.push({
                               item: itemData.child('name').val(),
                               quantity: item.val()
                            });
                        });
                });
                this.setState({
                    orderData: orderData
                });
            });
    }

    componentWillMount() {
        this.getOrder(this.props.orderId)
    }

    componentDidMount() {
        dialogPolyfill.registerDialog(findDOMNode(this.refs.dialog));
    }

    handleRejectOrder() {
        const reason = this.refs.rejectReason.inputRef.value;
        if (reason === "") {
            this.setState({
               rejectReasonError: "Please specify something"
            });
        } else {
            database.ref(`pendingOrders/${this.props.orderId}`).once('value')
                .then(data => {
                    let order = data.val();
                    order["reason"] = reason;
                    database.ref(`rejectedOrders/${this.props.orderId}`).set(order)
                        .then(() => {
                            database.ref(`pendingOrders/${this.props.orderId}`).remove();
                            this.setState({
                                openDialog: false
                            });
                        })
                });
        }
    }

    handleAcceptOrder() {
        database.ref(`pendingOrders/${this.props.orderId}`).once('value')
            .then(data => {
                database.ref(`inProgressOrders/${this.props.orderId}`).set(data.val())
                    .then(() => {
                        database.ref(`pendingOrders/${this.props.orderId}`).remove();
                    })
            });
    }

    handleOpenDialog() {
        this.setState({
            openDialog: true
        });
    }

    handleCloseDialog() {
        this.setState({
            openDialog: false
        });
    }

    render() {
        return (
            <div className="Order">
                <Card shadow={0}>
                    <CardText>
                        <DataTable
                            rows={this.state.orderData}
                            style={{width: '100%'}}
                        >
                            <TableHeader name="item">Item</TableHeader>
                            <TableHeader numeric name="quantity">Num</TableHeader>
                        </DataTable>
                    </CardText>
                    <CardActions border style={{
                        position: "relative"
                    }}>
                        <Button raised colored ripple onClick={this.handleAcceptOrder.bind(this)}>Accept</Button>
                        <Button raised colored ripple accent style={{
                            position: "absolute",
                            right: "10px"
                        }} onClick={this.handleOpenDialog.bind(this)}>Reject</Button>
                    </CardActions>
                </Card>
                <Dialog open={this.state.openDialog} ref="dialog">
                    <DialogTitle>Realy reject order?</DialogTitle>
                    <DialogContent>
                        <p>Please specifiy a reason for rejecting the order</p>
                        <Textfield label="..." error={this.state.rejectReasonError} ref="rejectReason"/>
                    </DialogContent>
                    <DialogActions>
                        <Button type='button' onClick={this.handleRejectOrder.bind(this)}>Reject</Button>
                        <Button type='button' onClick={this.handleCloseDialog.bind(this)}>Cancel</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

class InProgressOrder extends Component {
    state = {
        orderData: [],
    };

    getOrder(orderId) {
        database.ref(`inProgressOrders/${orderId}`).on('value', data => {
                let orderData = [];
                data.child('cart').forEach(item => {
                    database.ref('menu/' + data.child('stall').val() + '/' + item.key).once('value')
                        .then(itemData => {
                            orderData.push({
                               item: itemData.child('name').val(),
                               quantity: item.val()
                            });
                        });
                });
                this.setState({
                    orderData: orderData
                });
            });
    }

    componentWillMount() {
        this.getOrder(this.props.orderId)
    }

    handleFinishOrder() {
        database.ref(`inProgressOrders/${this.props.orderId}`).once('value')
            .then(data => {
                database.ref(`finishedOrders/${this.props.orderId}`).set(data.val())
                    .then(() => {
                        database.ref(`inProgressOrders/${this.props.orderId}`).remove();
                    })
            });
    }

    render() {
        return (
            <div className="Order">
                <Card shadow={0}>
                    <CardText>
                        <DataTable
                            rows={this.state.orderData}
                            style={{width: '100%'}}
                        >
                            <TableHeader name="item">Item</TableHeader>
                            <TableHeader numeric name="quantity">Num</TableHeader>
                        </DataTable>
                    </CardText>
                    <CardActions border style={{
                        position: "relative"
                    }}>
                        <Button raised colored ripple onClick={this.handleFinishOrder.bind(this)}>Finish</Button>
                    </CardActions>
                </Card>
            </div>
        )
    }
}

class FinishedOrder extends Component {
    state = {
        orderData: [],
    };

    getOrder(orderId) {
        database.ref(`finishedOrders/${orderId}`).on('value', data => {
                let orderData = [];
                data.child('cart').forEach(item => {
                    database.ref('menu/' + data.child('stall').val() + '/' + item.key).once('value')
                        .then(itemData => {
                            orderData.push({
                               item: itemData.child('name').val(),
                               quantity: item.val()
                            });
                        });
                });
                this.setState({
                    orderData: orderData
                });
            });
    }

    componentWillMount() {
        this.getOrder(this.props.orderId)
    }

    render() {
        return (
            <div className="Order">
                <Card shadow={0}>
                    <CardText>
                        <DataTable
                            rows={this.state.orderData}
                            style={{width: '100%'}}
                        >
                            <TableHeader name="item">Item</TableHeader>
                            <TableHeader numeric name="quantity">Num</TableHeader>
                        </DataTable>
                        <h6>State: Looking for customer</h6>
                    </CardText>
                </Card>
            </div>
        )
    }
}

export default class Orders extends Component {
    state = {
        pendingOrders: [],
        inProgressOrders: [],
        finishedOrders: [],
    };

    getOrders(id) {
        const self = this;
        database.ref('pendingOrders').orderByChild('stall').equalTo(id).on('value', data => {
            const pendingOrders = [];
            data.forEach(order => {
               pendingOrders.push(order.key);
            });
            self.setState({
                pendingOrders: pendingOrders
            });
        });
        database.ref('inProgressOrders').orderByChild('stall').equalTo(id).on('value', data => {
            const inProgressOrders = [];
            data.forEach(order => {
               inProgressOrders.push(order.key);
            });
            self.setState({
                inProgressOrders: inProgressOrders
            });
        });
        database.ref('finishedOrders').orderByChild('stall').equalTo(id).on('value', data => {
            const finishedOrders = [];
            data.forEach(order => {
               finishedOrders.push(order.key);
            });
            self.setState({
                finishedOrders: finishedOrders
            });
        });
    }

    componentDidMount() {
        this.getOrders(this.props.stallId);
    }
    componentWillReceiveProps(newProps) {
        this.getOrders(newProps.stallId);
    }

    render() {
        const pendingOrders = [];
        this.state.pendingOrders.forEach(order => {
            pendingOrders.push(<PendingOrder key={order} orderId={order}/>)
        });
        const inProgressOrders = [];
        this.state.inProgressOrders.forEach(order => {
            inProgressOrders.push(<InProgressOrder key={order} orderId={order}/>)
        });
        const finishedOrders = [];
        this.state.finishedOrders.forEach(order => {
            finishedOrders.push(<FinishedOrder key={order} orderId={order}/>)
        });
        return (
            <div className="Orders">
                <h2>Pending orders</h2>
                <div className="PendingOrders">
                    {pendingOrders}
                </div>
                <h2>In progress orders</h2>
                <div className="InProgressOrders">
                    {inProgressOrders}
                </div>
                <h2>Orders out for delivery</h2>
                <div className="FinishedOrders">
                    {finishedOrders}
                </div>
            </div>
        );
    }
}
