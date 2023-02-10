import React, { Component } from "react";

import { Crisp } from "crisp-sdk-web";

class CrispChat extends Component {
    componentDidMount () {
        Crisp.configure("085306e5-8d52-432e-9425-2af20eb36d4d");
    }

    render () {
        return null;
    }
}
export default CrispChat