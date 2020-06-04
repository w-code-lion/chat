$(function() {
    $.sliding_quiz = {
        version: '1.0'
    };
    $.fn.sliding_quiz = function(config){
        config = $.extend({}, {
            instruction: null,
            questions: null,
            locale: null,
            when_finish_submit_url : '',
            contact_form_submit_url : '',
            effect: 'slide',
            callback: function() {}
        }, config);

        //check question
        if(config.questions == null || config.questions == undefined){
            return false;
        }
        // initial container object
        var container = $(this);
        container.addClass('quiz-content');
        // number of questions
        var numOfQuestions = config.questions.length;
        // array user choice answer
        var userAnswers = [];
        // array user choice answer for email
        var userAnswersForEmail = [];
        /*
        current position of fieldset / navigation link
        */
        var current     = 1;

        //set locale
        var locale = {
            'msg_not_found' : 'Cannot find questions',
            'msg_please_select_an_option' : 'Please select an option',
            'msg_question' : 'Question',
            'msg_you_scored' : 'You scored',
            'msg_click_to_review' : 'Click to Question button to review your answers',
            'bt_start' : 'Start',
            'bt_next' : 'Next',
            'bt_back' : 'Back',
            'bt_finish' : 'Finish',
            'contact_heading' : 'Submit Your Score',
            'contact_name' : 'Name',
            'contact_email' : 'Email',
            'contact_phone' : 'Phone',
            'contact_message' : 'Message',
            'contact_show_form_button' : 'Submit Your Score',
            'contact_submit_button' : 'Submit',
            'contact_thankyou' : 'Thank you for your submission.'
        };
        if(config.locale != null){
            $.each(locale, function(index, value) {
                if(config.locale[index] == undefined){
                    config.locale[index] = value;
                }
            })
        }else{
            config.locale = locale;
        }

        /*Initial question*/
        if (numOfQuestions === 0) {
            container.html('<div class="quiz-wrapper"><div class="steps"><form id="formElem" name="formElem" action="" method="post"><fieldset class="step"><legend>'+config.locale['msg_not_found']+'</legend></fieldset></form></div></div>');
            return;
        }

        /*Instruction Page*/
        var welcomePage = '';
        if(config.instruction != null){
            welcomePage = '<div class="quiz-wrapper" id="quiz-instruction-container">\n\
                    <div class="steps">\n\
                    <form>\n\
                    <fieldset class="step"><legend>' + config.instruction['title']+'</legend><div style="padding: 20px 10px;">'+config.instruction['description']+'</div></fieldset></form></div>\n\
                    <div id="quiz-navigation" style=""><ul style="float:right;margin-right:20px;"><li><a href="javascript:;;" id="btn-start-quiz">'+config.locale['bt_start']+'</a></ul></div>\n\
                    </div>';
        }

        /*Contact Page Form*/
        var competitionForm = '<fieldset class="step" style="display:none">\n\
        <legend>'+config.locale['contact_heading']+'</legend>\n\
                <table width="100%" class="competition-form" border="0" cellpadding="0" cellspacing="10">\n\
                    <tr><td width="1%" nowrap="">'+config.locale['contact_name']+'</td><td align="right"><input type="text" class="required letters_only" id="competitionName"/></td></tr>\n\
                    <tr><td width="1%" nowrap="">'+config.locale['contact_email']+'</td><td align="right"><input type="text" id="competitionEmail"/></td></tr>\n\
                    <tr><td width="1%" nowrap="">'+config.locale['contact_phone']+'</td><td align="right"><input type="text" id="competitionPhone"/></td></tr>\n\
                    <tr><td width="1%" nowrap="">'+config.locale['contact_message']+'</td><td align="right"><textarea id="competitionMessage"/></textara></td></tr>\n\
                </table>\n\
        </fieldset>';

        var showQuiz = (welcomePage == '')  ? 'show_container' : 'hide_container';
        var quizContent = '<div class="quiz-wrapper '+showQuiz+'"><div class="steps"><form id="formElem" name="formElem" action="" method="post">';
        for (questionIdx = 0; questionIdx < numOfQuestions; questionIdx++) {
            if(config.questions[questionIdx] != undefined){
                show = (questionIdx==0) ? "show" : "";
                quizContent += '<fieldset class="step '+show+'" question="'+(questionIdx+1)+'" choice=""><div class="page-number"><a href="#" class="page-number__text">1<span>/'+numOfQuestions+'</span>'+'</a></div><legend>'+config.questions[questionIdx].question+'</legend>';
                for (answerIdx = 0; answerIdx < config.questions[questionIdx].answers.length; answerIdx++) {
                    quizContent += '<p answer="'+(answerIdx+1)+'">'+config.questions[questionIdx].answers[answerIdx]+'</p>';
                }
                quizContent += '</fieldset>';
            };
        }
        NextFinishButton = '<a href="#" id="next-quiz">'+config.locale['bt_next']+'</a><a href="#" id="finish-quiz" style="display: none;"><i class="qicon-asterisk qicon-white"></i>&nbsp;'+config.locale['bt_finish']+'</a>';
        if(numOfQuestions == 1){
            NextFinishButton = '<a href="#" id="finish-quiz"><i class="qicon-asterisk"></i>&nbsp;'+config.locale['bt_finish']+'</a>';
        }
        quizContent += '</form></div><div id="quiz-notice"><span class="label label-important"><i class="qicon-exclamation-sign qicon-white"></i>&nbsp;'+config.locale['msg_please_select_an_option']+'</span></div><div id="quiz-navigation" style="display:none;"><ul><li class="disabled"><a href="#" id="back-quiz" class="back-quiz">'+config.locale['bt_back']+'</a></li><li class="">'+NextFinishButton+'</li></ul></div><div class="progress-container"><div class="progress"></div></div></div></div>';
        container.html(welcomePage+quizContent);

        /*Initial object*/
        // initial progress object
        var progress = container.find('.progress');
        var progressContainer = container.find('.progress-container');
        var progressWidth = progressContainer.width() - 40;
        // initial steps object
        var steps = container.find('.steps'),
        notice = container.find('#quiz-notice'),
        page_number = container.find(".page-number a"),
        next_button = container.find("#next-quiz"),
        back_button = container.find("#back-quiz"),
        finish_button = container.find("#finish-quiz");
        var $totalWeightage = 0;
        var $finalWeightageArray = Array();
        /*
        sum and save the widths of each one of the fieldsets
        set the final sum as the total width of the steps element
        */
        var stepsWidth  = 0;
        var widths      = new Array();
        steps.find('.step').each(function(i){
            var $step       = $(this);
            widths[i]       = stepsWidth;
            stepsWidth      += $step.width();//600
        });
        steps.width(stepsWidth);

        // Function to get the Max value in Array
        Array.max = function( array ){
            return Math.max.apply( Math, array );
        };
        /**
         * Get max length of weightage array
         */
        var $listWeightageLength = Array();
        for (var i = 0, toLoopTill = config.questions.length; i < toLoopTill; i++) {
            $totalWeightage += parseFloat(Array.max(config.questions[i].weight));
            $weightageLength = config.questions[i].weight.length;
            $listWeightageLength[i] = $weightageLength;
        }
        var $maxWeightageLength = Array.max($listWeightageLength);
//console.log('Max Array Length: '+$maxWeightageLength);
        /*
        Answer selected
        */
        container.find('p').click(function () {
            var thisAnswer = $(this);

            if (thisAnswer.hasClass('selected')) {
                thisAnswer.removeClass('selected');
                thisAnswer.parents('.step').attr('choice', '');
            } else {
                thisAnswer.parents('.step').children('p').removeClass('selected');
                thisAnswer.addClass('selected');
                thisAnswer.parents('.step').attr('choice', thisAnswer.attr('answer'));
            }
        });

        /*
        show the navigation bar
        */
        container.find('#quiz-navigation').show();

        /*
        *bind Start button click
        */
        container.find('#btn-start-quiz').bind('click', function(){
            container.find('#quiz-instruction-container').fadeOut(500, function() {
                $(this).next().fadeIn(500);
                $(this).next().find('#quiz-navigation').show();
            });
        });
        /*
        when clicking on a next link
        the form slides to the next corresponding fieldset
        */
        next_button.click(function(e){
            current = steps.find(".show");

            //calculate index
            index   = current.index() + 1;
            index ++;
            slider.next(index);

            e.preventDefault();
        });

        /*
        when clicking on a back link
        the form slides to the back corresponding fieldset
        */
        back_button.click(function(e){

            current = steps.find(".show");

            //calculate index
            index   = current.index() + 1;
            index--;
            slider.back(index);

            e.preventDefault();
        });

        /*
        when clicking on a finish link
        show the user results
        */
        finish_button.click(function(e){
            slider.finish();
            e.preventDefault();
        });

        var slider = {
            next: function(index){
                if (container.find('.show').attr('choice').length === 0) {
                    notice.slideDown(300);
                    return false;
                };
                notice.slideUp();
                if(widths[index-1] != undefined && config.effect == 'slide'){
                    steps.stop().animate({
                        marginLeft: '-' + widths[index-1] + 'px'
                    },500,function(){
                        //mark current slide as show
                        steps.find(".show").removeClass('show');
                        current.next('fieldset').addClass('show');

                        //increase page number
                        page_number.html(index+"<span>/"+numOfQuestions+'</span>');

                        //enable first back button
                        back_button.parent().removeClass("disabled");
                        //last next button become finish
                        if(numOfQuestions == index){
                            next_button.hide();
                            finish_button.show();
                        }
                    });
                }else{
                    steps.find(".show").fadeOut(500, function() {
                        //mark current slide as show
                        $(this).removeClass('show');
                        current.next('fieldset').addClass('show');
                        current.next('fieldset').fadeIn(500);

                        //increase page number
                        page_number.html(index+"<span>/"+numOfQuestions+'</span>');

                        //enable first back button
                        back_button.parent().removeClass("disabled");
                        //last next button become finish
                        if(numOfQuestions == index){
                            next_button.hide();
                            finish_button.show();
                        }

                    });
                }
                //Calculate & Animate progress bar
                progress.animate({width: progress.width() + Math.round(progressWidth / numOfQuestions)}, 300);
            },
            back: function(index){
                notice.slideUp();

                if(index-1 >= 0 && config.effect == 'slide'){
                    steps.stop().animate({
                        marginLeft: '-' + widths[index-1] + 'px'
                    },500,function(){
                        //mark current slide as show
                        steps.find(".show").removeClass('show');
                        current.prev('fieldset').addClass('show');

                        //decrease page number
                        page_number.html(index+"<span>/"+numOfQuestions+'</span>');

                        //disabled first back button
                        if((index - 1) <= 0){
                            back_button.parent().addClass("disabled");
                        }
                        //enabled last next button
                        if(numOfQuestions > index){
                            finish_button.hide();
                            next_button.show();
                            next_button.parent().removeClass("disabled");
                        }
                    });
                }else{
                    steps.find(".show").fadeOut(500, function() {
                        //mark current slide as show
                        $(this).removeClass('show');
                        current.prev('fieldset').addClass('show');
                        current.prev('fieldset').fadeIn(500);

                        //decrease page number
                        page_number.html(index+"<span>/"+numOfQuestions+'</span>');

                        //disabled first back button
                        if((index - 1) <= 0){
                            back_button.parent().addClass("disabled");
                        }
                        //enabled last next button
                        if(numOfQuestions > index){
                            finish_button.hide();
                            next_button.show();
                            next_button.parent().removeClass("disabled");
                        }


                    });
                }
                //Calculate & Animate progress bar
                progress.animate({width: progress.width() - Math.round(progressWidth / numOfQuestions)}, 300);

            },
            finish: function(){
                if (container.find('.show').attr('choice').length === 0) {
                    notice.slideDown(300);
                    return false;
                };

                //get user answer
                container.find('.step').each(function (index) {
                    questionNumber = $(this).attr('question');
                    userSelect = $(this).attr('choice');
                    userAnswers[questionNumber] = userSelect;
                });

                //quiz result
                var numOfRightAnswer = 0;
                var finalScore = 0,
                questionList = '',
                answerList = '';

                for (i = 0; i < numOfQuestions; i++) {
                    if(config.questions[i] == undefined) {
                        continue;
                    }

                    $userScore = config.questions[i].weight[(userAnswers[i+1]-1)];
                    $maxScore = Array.max(config.questions[i].weight);

                    bt_rightOrwrong = 'label-important';
                    sign_rightOrwrong = '&nbsp;<i class="qicon-remove qicon-white"></i>';
                    if ($userScore == $maxScore) {
                        numOfRightAnswer++;
                        bt_rightOrwrong = 'label-success';
                        sign_rightOrwrong = '&nbsp;<i class="qicon-ok qicon-white"></i>';
                    }

                    questionList += '<span class="label '+bt_rightOrwrong+' link-white"><a href="#q' + (i + 1)+'" questionNumber="' + (i + 1)+'" onclick="return false;" class="quiz-result">'+config.locale['msg_question']+' ' + (i + 1)+'</a>'+sign_rightOrwrong +'</span>';
                    answerList += '<div id="q' + (i + 1)+'" class="final-result">';
                    answerList += '<h3>'+config.questions[i].question+'</h3>';
                    var emailContentList = {};
                     //add question and user ans to email content
                    emailContentList['question_id'] = config.questions[i].id;
                    emailContentList['question'] = config.questions[i].question;

                    for (answersIndex = 0; answersIndex < $maxWeightageLength; answersIndex++) {
                        var rightOrwrong = '';


                        if (config.questions[i].weight[answersIndex] == $maxScore) {
                            rightOrwrong += 'right';
                        }

                        if (userAnswers[i+1] == (answersIndex + 1) ) {
                            rightOrwrong = 'selected '+rightOrwrong;

                            emailContentList['answer'] = config.questions[i].answers[answersIndex];

                            if ($userScore < $maxScore) {
                                rightOrwrong += ' wrong';
                            }

                            //sum score
                            finalScore += parseFloat($userScore);

                            emailContentList['score'] = config.questions[i].weight[answersIndex];
                        }

                        if(typeof config.questions[i].answers[answersIndex] === "undefined"){
                            //do nothing
                        }else{
                            answerList += '<p class="' + rightOrwrong + '">' + config.questions[i].answers[answersIndex] + '</p>';
                        }
                    }
                    //add to email content
                    userAnswersForEmail.push(emailContentList);

                    //explanation
                    expId = 'inline'+i;
                    expLink = 'href="#inline'+i+'"';
                    explain = config.questions[i].explanation;
                    if(typeof explain == 'undefined' || explain == ''){
                        explain = '';
                    }else{
                        explain = '<div id="'+expId+'" class="explanation-text" style="display: none;">'+config.questions[i].explanation+'</div>';
                        //explain +='<a title="Explanation" class="simple-modal-link" '+expLink+' >'+config.locale['msg_explanation']+'</a>';
                    }
                    answerList += '<div class="quiz-explain">'+explain+'</div></div>';

                }
//console.log($theWeightage);
//console.log('total score:'+finalScore);
//console.log(userAnswersForEmail);
                var score = finalScore;
                var contact_button = (config.contact_form_submit_url != '') ? '<li><a href="./" id="show-submit-score"><i class="qicon-asterisk qicon-white"></i>&nbsp;Start Again</a></li>' : '';
                var resultContent = '<div class="quiz-wrapper">\n\
                    <div class="steps">\n\
                    <form id="competitionForm" name="competitionForm" action="submit_answers.php" method="post">\n\
                    <input type="hidden" value="'+score+'" id="quiz_user_score">\n\
                    <h3 class="skill">' +config.locale['msg_you_scored']+' '+score+'/'+$totalWeightage+'</h3>\n\
                    <fieldset class="step">\n\
                    <div class="resultset">'+questionList+'</div>\n\
                    <div id="your-score" class="final-result">\n\
                        <span class="label label-warning"><i class="qicon-exclamation-sign qicon-white"></i> '+config.locale['msg_click_to_review']+'</span>\n\
                    </div>'+answerList+'</fieldset>'+competitionForm+'</form></div>\n\
                    <div id="quiz-navigation" style=""><ul style="float:right"><li><a href="#" id="btn-submit-score">'+config.locale['contact_submit_button']+'</a><img src="img/ajax-loader.gif" alt="loading" id="ajax-loader"></li>'+contact_button+'</ul></div>\n\
                    </div>';

                //parse HTML
                container.html(resultContent);

                //when click finish - submit score to server
                if(config.when_finish_submit_url != ''){
                    var params = {
                        'user_score': score,
                        'results': userAnswersForEmail
                    };

                    jQuery.ajax({
                        type:'POST',
                        data: params,
                        url: config.when_finish_submit_url,
                        success: function(response) {
                            //console.log(response);
                            $('#server-response').html(response);
                        }
                    });
                }


                //unbind select answer
                container.find('p').unbind('click');
                //bind explanation click event
                container.find('.simple-modal-link').click(function (e) {
                    $this = $(this);
                    $href = $this.attr('href');
                    $($href).modal();
                    return false;

                });

                //validate form
                var competition = {
                    isValidEmailAddress : function(emailAddress){
                        var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
                        return pattern.test(emailAddress);
                    },
                    validate : function(){
                        var error = 1;
                        var hasError = false;

                        $('#competitionForm').find(':input:not(button)').each(function(){
                            var $this       = $(this);

                            if($this.hasClass('required') && !$this.is(':disabled')){
                                var valueLength = jQuery.trim($this.val()).length;

                                if(valueLength == '' || (!$this.prop("checked") && $this.attr('type') == 'checkbox') ){
                                    $this.css('background-color','#FFEDEF');
                                    if($this.attr('type') == 'checkbox'){
                                        $this.parent().addClass('red');
                                    }
                                    hasError = true;
                                }else{
                                    $this.css('background-color','#FFFFFF');
                                    if($this.attr('type') == 'checkbox'){
                                        $this.parent().removeClass('red');
                                    }
                                }
                            }
                        });

                        if($('#competitionName').hasClass('letters_only')){
                            var $this = $('#competitionName');
                            var valueLength = jQuery.trim($this.val()).length;
                            var letterOnly = /^[a-zA-Z ]+$/;

                            if (valueLength == '' || !letterOnly.test($this.val())) {
                                $this.css('background-color','#FFEDEF');
                                hasError = true;
                            }else{
                                $this.css('background-color','#FFFFFF');
                            }
                        }

                        if(competition.isValidEmailAddress($('#competitionEmail').val()) == false){
                            $('#competitionEmail').css('background-color','#FFEDEF');
                            $('#competitionEmail').focus();
                            hasError = true;
                        }else{
                            $('#competitionEmail').css('background-color','#FFFFFF');
                        }

                        if(hasError){
                            error = -1;
                        }
                        return error;
                    }
                }

                //submit score and send to email
                container.find('#btn-submit-score').bind('click', function(){
                    $this = $(this);
                    $ajaxLoader = $('#ajax-loader');

                    $ajaxLoader.show();
                    $this.hide();

                    noError = competition.validate();
                    if(noError == 1){
                        var params = {
                            'name': $('#competitionName').val(),
                            'email': $('#competitionEmail').val(),
                            'phone': $('#competitionPhone').val(),
                            'message': $('#competitionMessage').val(),
                            'user_score': $('#quiz_user_score').val(),
                            'results': userAnswersForEmail
                        };
                        url = config.contact_form_submit_url;

                        jQuery.ajax({
                            type:'POST',
                            data:params,
                            url: url,
                            success: function(response) {
                                //console.log(response);
                                var thanksContent = '<div class="quiz-wrapper">\n\
                                    <div class="steps">\n\
                                    <form id="competitionForm" name="competitionForm" action="quiz_submit_score.php" method="post">\n\
                                    <fieldset class="step" style="display:block">\n\
                                    <legend>'+config.locale['contact_thankyou']+'</legend>\n\
                                    </fieldset></form></div>\n\
                                    </div>';

                                //parse HTML
                                container.html(thanksContent);
                            }
                        });
                    }else{
                        $ajaxLoader.hide();
                        $this.show();
                    }
                });

                //bind show submit score form
                container.find('#show-submit-score').bind('click', function(){
                    $(this).hide();
                    container.find('.step:first').fadeOut(500, function() {
                        $('#btn-submit-score').attr('style', 'display: block');
                        $(this).next().fadeIn(500);
                    });
                });

                //bind show result event
                container.find('.quiz-result').bind('click', function(){
                    container.find('.final-result').hide();
                    $('.quiz-result').removeClass('active');
                    $(this).addClass('active');
                    questionNumber = $(this).attr('questionNumber');
                    container.find('#q' + questionNumber).show();
                });
                //if(numOfQuestions == 1){ container.find('.quiz-result').trigger('mouseenter'); }
            }
        };
    };
});

























        $(function()
            {

      
                $("#quiz-content").sliding_quiz ({
                     'instruction':
                     {
                        'title': 'CSS Quiz',
                        'description' : 'Test your knowledge of CSS with our CSS Quiz, the test currently contains 20 questions. You will get 1 point for each correct answer. At the end of the Quiz, your total score will be displayed. Maximum score is 20 points. If you don\'t get the full score, you\'ll have an option to try again.<br /><br />Start the quiz now by clicking on the button below.'
                     },
                    'questions':
                    [
                         {
                            'id'        : 1,
                            'question'  : 'What is the correct CSS syntax for making all the &lt;span&gt; elements bold?',
                            'answers'   : ['span {text-size:bold}','span {font-weight:bold}','&lt;span style=&quot;font-size:bold&quot;&gt;','&lt;span style=&quot;text-size:bold&quot;&gt;'],
                            'weight'     : [0, 1, 0, 0],
                        },
                        {
                            'id'        : 2,
                            'question'  : 'In the following code snippet, what value is given for the left margin:<br>margin: 5px 10px 3px 8px;',
                            'answers'   : ['3px','10px','8px','5px'],
                            'weight'     : [0, 0, 1, 0],
                        },
                        {
                            'id'        : 3,
                            'question'  : 'How do you add a comment in a CSS file?',
                            'answers'   : ['/* this is a comment */','// this is a comment //','// this is a comment','&lt;! this is a comment&gt;'],
                            'weight'     : [1, 0, 0, 0],
                        },
                        {
                            'id'        : 4,
                            'question'  : 'What property is used to change the text color of an element?',
                            'answers'   : ['fontcolor:','textcolor:','color:','font-color:'],
                            'weight'     : [0, 0, 1, 0],
                        }
                    ],
                    'locale': //optional
                    {
                        'msg_not_found' : 'Cannot find questions',
                        'msg_please_select_an_option' : 'Please select an answer',
                        'msg_question' : 'Question',
                        'msg_you_scored' : 'You scored',
                        'msg_click_to_review' : 'Click the question button to review your answers',
                        'bt_next' : 'Next',
                        'bt_back' : '<i class="i-left"></i>',
                        'bt_finish' : 'Finish',
                        'bt_contact' : 'Submit Your Score',
                        'contact_heading' : 'Submit Your Score'
                    },
                    'when_finish_submit_url': '',
                    'contact_form_submit_url': '',
                    //'effect': 'fade'
                });
            });