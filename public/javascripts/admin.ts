/// <reference path='typings/jquery.d.ts' />
declare var wysihtml5 : any;
declare var wysihtml5ParserRules : any;

$(function(){

    var editorElem = document.querySelector('.wyshtml5');
    if (editorElem) {
        wysihtml5.commands.clearFormat = {
          exec: function(composer, command) {
            composer.doc.execCommand('removeFormat');
          }
        };
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
    });


    $('body').on('change', '.js-type', e => {
      var val = $(e.currentTarget).val()
      if (val === 'fact') {
        $('.js-fact').show();
      } else {
        $('.js-fact').hide();
      }
    });
    $('.js-type').change();


    $('body').on('click', '.js-remove-source', e => {
      e.preventDefault();
      var $row = $(e.currentTarget).closest('.js-source-template');
      $row.remove();
    });



    $('body').on('click', '.js-add-source', e => {
      e.preventDefault();
      var link = $('.js-new-source').val();
      if ($.trim(link).length == 0) {
        return;
      }

      console.log('.js-actual-sources input[value="'+link+'"]');
      if ($('.js-actual-sources input[value="'+link+'"]').length) {
        alert('El link ya existe');
        return;
      }
      var $row = $('.js-source-template:last').clone();
      $row.find('input').val(link).attr('value', link);
      if (!$row.find('input')[0].checkValidity()) {
        alert('El link es inválido - Ej. http://www.google.com.ar');
        return;
      }
      var len = $('.js-source-template').length - 1;
      $row.find('input').attr('name', 'source['+ len + ']');
      $('.js-actual-sources').append($row);
      $('.js-new-source').val("http://").focus();
    });

    $('body').on('submit', 'form', e => {
      if ($('.js-new-source').val() !== 'http://') {
        $('.js-add-source').click();
      }
    });

    ( () => {
      var $tables = {
        node: $('table.node-table'),
        edge: $('table.edge-table'),
      };
      function highlight(term, container) {
        $(container).find('td a').each((idx, e) => {
          var $e = $(e);
          if (!$e.data('original')) {
            $e.data('original', $e.html());
          }
          var escapedTerm = term.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
          var html = $e.data('original').replace(new RegExp("("+escapedTerm+")", "ig"), "<span class='highlight'>$1</span>")
          $e.html(html);
        });
      }

      $('body').on('input', 'input.js-search-table', e => {
        var $e = $(e.currentTarget);
        var type = $e.data('type');
        var table = $tables[type][0];
        var term = $.trim($e.val());
        $tables[type].find('span.highlight').removeClass('highlight');
      	var terms = term.toLowerCase().split(" ");
      	for (var r = 1; r < table.rows.length; r++) {
      		var display = '';
      		for (var i = 0; i < terms.length; i++) {
      			if (table.rows[r].getAttribute('data-search').replace(/<[^>]+>/g, "").toLowerCase()
      				.indexOf(terms[i]) < 0) {
      				display = 'none';
      			} else {
      				if (terms[i].length)
                highlight(terms[i], table.rows[r]);
      			}
      			table.rows[r].style.display = display;
      		}
      	}
      });
    })()



});
