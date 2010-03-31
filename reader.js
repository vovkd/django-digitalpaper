var libeReader = function() {
    var _publicationId, _bookName, _publication, _selectedBook, _pages, _displayedPage, _ratio;
    
    function defaultAjaxError(XMLHttpRequest, textStatus, errorThrown) {
        console.log(XMLHttpRequest, textStatus, errorThrown);
    }
    
    function bindButtons() {
        jQuery('#previousButton, #previousCorner').click(showPreviousPage);
        jQuery('#nextButton, #nextCorner').click(showNextPage);
        jQuery('#firstButton').click(showFirstPage);
        jQuery('#lastButton').click(showLastPage);
    }
    
    function unbindButtons() {
        jQuery('#previousButton, #previousCorner').unbind("click", showPreviousPage);
        jQuery('#nextButton, #nextCorner').unbind("click", showNextPage);
        jQuery('#firstButton').unbind("click", showFirstPage);
        jQuery('#lastButton').unbind("click", showLastPage);
    }
    
    function showHoverCorner() {
        jQuery(this).css('opacity', 1);
    }
    function hideHoverCorner() {
        jQuery(this).css('opacity', 0);
    }
    
    function displayPagination() {
        var previousButtons = jQuery('#previousCorner, #previousButton, #firstButton');
        if (_displayedPage -2 >= 0) {
            previousButtons.show();
        } else {
            previousButtons.hide();
        }
        
        var nextButtons = jQuery('#nextCorner, #nextButton, #lastButton');
        if (_displayedPage + 2 <= _selectedBook.total) {
            nextButtons.show();
        } else {
            nextButtons.hide();
        }
    }
    
    function showPage(number) {
        var newDisplayedPage = number - number % 2;
        
        // Non-existant page, nothing to do
        if (!_pages[newDisplayedPage] && !_pages[newDisplayedPage + 1]) {
            return;
        }
        
        unbindButtons();
        
        var evenSide = jQuery('#evenSide');
        var finalWidth = evenSide.width();
        var height = evenSide.parent().height();
        var position = evenSide.position();
        
        var leftPage = jQuery(document.createElement('div'));
        leftPage.addClass('leftPage');
        if (_pages[newDisplayedPage]) {
            leftPage.css('background-image', 'url(' + _pages[newDisplayedPage].imageSource + ')');
        }
        
        var rightPage = jQuery(document.createElement('div'));
        rightPage.addClass('rightPage');
        if (_pages[newDisplayedPage + 1]) {
            rightPage.css('background-image', 'url(' + _pages[newDisplayedPage + 1].imageSource + ')');
        }
        
        var transitionElement = jQuery(document.createElement('div'));
        transitionElement.addClass('transitionPage');
        transitionElement.css('height', height);
        if (_displayedPage > newDisplayedPage) {
            transitionElement.css('left', 0);
        } else {
            transitionElement.css('right', 0);
        }
        transitionElement.append(leftPage);
        transitionElement.append(rightPage);
        
        var transitionContainerElement = jQuery(document.createElement('div'));
        transitionContainerElement.addClass('transitionContainer');
        transitionContainerElement.css({'width': 2 * finalWidth, 'height': height,
            'left': position.left});
        transitionContainerElement.append(transitionElement);
        evenSide.parent().append(transitionContainerElement);
        
        transitionElement.animate({'width': 2 * finalWidth}, function() { cleanAfterShowPage(number); jQuery(this).parent().detach()});
    }
    
    function cleanAfterShowPage(number) {
        if (_displayedPage != "undefined") {
            if (_pages[_displayedPage]) {
                _pages[_displayedPage].hide();
            }
            if (_pages[_displayedPage + 1]) {
                _pages[_displayedPage + 1].hide();
            }
        }

        var newDisplayedPage = number - number % 2;
        if (_pages[newDisplayedPage] || _pages[newDisplayedPage + 1]) {
            _displayedPage = newDisplayedPage;
            window.location.hash = "#" + _displayedPage;
        }

        if (_pages[_displayedPage]) {
            _pages[_displayedPage].show();
        }
        if (_pages[_displayedPage + 1]) {
            _pages[_displayedPage + 1].show();
        }
        
        displayPagination();
        bindButtons();
    }
    
    function showPreviousPage(e) {
        e.preventDefault();
        showPage(_displayedPage - 2);
    }
    function showNextPage(e) {
        e.preventDefault();
        showPage(_displayedPage + 2);
    }
    
    function showFirstPage(e) {
        e.preventDefault();
        showPage(0);
    }
    function showLastPage(e) {
        e.preventDefault();
        showPage(_selectedBook.total);
    }
    
    function ratioKnown(e, ratio) {
        var sides = jQuery('#evenSide, #oddSide');
        var height = sides.height();
        // If no image downloaded, leave and wait for the next event
        if (height < 100) {
            return;
        }

        _ratio = ratio;
        
        sides.width(height * ratio);
        jQuery(window).unbind(e);
    }
    
    function handlePublication(data) {
        _publication = data.publication[0];
        
        _selectedBook = _publication.book[0];
        for (var i in _publication.book) {
            if (_publication.book[i].name == _bookName) {
                _selectedBook = _publication.book[i];
                break;
            }
        }
        
        // Hack to know the ratio of the pages for a publication
        jQuery(window).bind('ratio-known', ratioKnown);
        
        _pages = new Array(parseInt(_selectedBook.total, 10));
        for (var i = 0, il = _selectedBook.page.length; i < il ; i++) {
            var page = _selectedBook.page[i];
            _pages[page.pageNumber] = libePage(page.pageNumber, page.id);
        }
        
        var pageToShow = 0;
        if (location.hash != "") {
            var possiblePage = parseInt(location.hash.split('#')[1], 10);
            if (possiblePage >= 0 && possiblePage <= _selectedBook.total) {
                pageToShow = possiblePage;
            }
        }
        cleanAfterShowPage(pageToShow);
    }
    
    function init(publicationId, bookName) {
        _publicationId = publicationId;
        _bookName = bookName;
                
        var url = libeConfig.apiRoot + "publication_" + publicationId + ".json";
        jQuery.ajax({url: url, dataType: "json", success: handlePublication, error: defaultAjaxError});
        
        jQuery('#previousCorner, #nextCorner').hover(showHoverCorner, hideHoverCorner)
    }
    
    return {
        init: init,
        showPage: showPage,
        showPreviousPage: showPreviousPage,
        showNextPage: showNextPage
    }
}();
