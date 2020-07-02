const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const QuestionSchema = new Schema({
    question:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    comments:[{
        writtenBy: {
            type:String,
            required: true
        },
        text:{
            type:String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
       
    }],
    
    date: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('questions', QuestionSchema)