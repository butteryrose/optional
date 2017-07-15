/**
 * 入口程序
 * Created by xuebj on 16/5/16.
 */

import React from 'react';
import {render} from 'react-dom';
import "./reset.css";
import "./global.css";
import "./less/app.less";
import Wizard from './optional/wizard/wizard.js';
import OpionalList from './optional/list/list.js';

render(<Wizard/>,document.getElementById("optionalWizard"));
render(<OpionalList/>,document.getElementById("optionalList"));
