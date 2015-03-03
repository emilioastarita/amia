/// <reference path='typings/jquery.d.ts' />
declare var wysihtml5 : any;
declare var wysihtml5ParserRules : any;

$(function(){
    var editorElem = document.querySelector('.wyshtml5');
    if (editorElem) {
        var editor = new wysihtml5.Editor(document.querySelector('.wyshtml5'), {
            parserRules:  wysihtml5ParserRules,
            toolbar: document.querySelector('.toolbar')
        });
    }
    var $chosenSelects : any = $(".chosen-select");
    $chosenSelects.length && $chosenSelects.chosen();
    $('body').on('click', '.js-delete', e => {
        e.preventDefault();
        if (!confirm('¿Desea eliminar?')) {
          return;
        }
        var url = $(e.currentTarget).attr('href');
        $.post(url, data => {
          console.log(data);
          if (data.err) {
            alert('Ocurrió un error al eliminar: ' + JSON.stringify(data.err))
            return;
          }
          location.reload();
        });
    })
});
