  
  //Combine objects on the main namespace
  Form.helpers = helpers;
  Form.Field = Field;
  Form.editors = editors;
  Form.validators = validators;
  Form.setTemplates = helpers.setTemplates;
  
  //Make default templates active
  Form.setTemplates(templates, classNames);
