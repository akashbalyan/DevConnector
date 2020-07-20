import React ,{useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {addComment} from '../../actions/post';

const CommentForm = ({addComment,postId}) => {
    const [formData,setFormData]=useState({
        text:''
    })
    const {text}=formData;
    return (
        <div class="post-form">
        <div class="bg-primary p">
          <h3>Leave a Comment</h3>
        </div>
        <form onSubmit={(e)=>{
            e.preventDefault();
            addComment(postId,formData);
            setFormData({text:''});
        }} class="form my-1">
          <textarea
            name="text"
            cols="30"
            rows="5"
            placeholder="Create a post"
            required
            value={text}
            onChange={(e)=>setFormData({text:e.target.value})}
          ></textarea>
          <input type="submit" class="btn btn-dark my-1" value="Submit" />
        </form>
      </div>
    );
};

CommentForm.propTypes = {
    addComment:PropTypes.func.isRequired,
    postId:PropTypes.string.isRequired
};

export default connect(
    null,
    {
        addComment
    }
)(CommentForm);