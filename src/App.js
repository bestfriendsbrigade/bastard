import React, { useEffect, useState } from 'react';
import buttonSpriteSheetUrl from './assets/buttons.png';
import createdByUrl from './assets/created_by.png';
import newUrl from './assets/new.png';
import titleUrl from './assets/title.png';
import spinnerUrl from './assets/spinner.gif';
import contentfulClient from './shared/contentfulClient';
import { Transition } from 'react-transition-group';

const buttonBaseStyle = {
  background: `url(${buttonSpriteSheetUrl})`,
  border: 'none',
  height: 15,
};

const transitionDuration = 250;

const parser = document.createElement('a');

const App = () => {
  parser.href = window.location.href;

  const [lastSeenIndex, setLastSeenIndex] = useState(
    parseInt(localStorage.getItem('lastSeenIndex'), 10) || 0
  );
  const [comics, setComics] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(getIndexFromHash(parser.hash));

  useEffect(() => {
    contentfulClient.getEntries({
      content_type: 'comic',
      order: 'fields.order',
    })
      .then((comics) => setComics(comics));

    window.addEventListener('hashchange', (event) => {
      parser.href = event.newURL;
      const newIndex = parseInt(parser.hash.replace('#/', '') - 1);
      if (!Number.isNaN(newIndex)) {
        setCurrentIndex(newIndex);
      }
    });

    if (!window.location.hash) {
      goToIndex(lastSeenIndex);
    }
  }, []);

  useEffect(() => {
    if (currentIndex > lastSeenIndex) {
      setLastSeenIndex(currentIndex);
    }
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem('lastSeenIndex', lastSeenIndex);
  }, [lastSeenIndex]);

  const previousIsDisabled = comics ? currentIndex === 0 : true;
  const nextIsDisabled = comics ? currentIndex >= comics.total - 1 : true;

  return (
    <div
      style={{
        backgroundColor: '#eaba00',
        padding: 16,
        maxWidth: 900,
        margin: `0 auto`,
      }}>
      <header
        style={{
          marginBottom: 24,
          textAlign: 'center',
        }}>
        <img
          alt="title"
          src={titleUrl}
          style={{ maxWidth: '100%' }} />
      </header>
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}>
        <div>
          <button
            onClick={goToFirst}
            style={{
              ...buttonBaseStyle,
              width: 69,
              marginRight: 24,
              backgroundPositionY: previousIsDisabled ? -15 : 0,
            }}
            disabled={previousIsDisabled} />
          <button
            onClick={goToPrevious}
            style={{
              ...buttonBaseStyle,
              width: 67,
              backgroundPositionX: -69,
              backgroundPositionY: previousIsDisabled ? -15 : 0,
            }}
            disabled={previousIsDisabled} />
        </div>
        <div>
          <button
            onClick={goToNext}
            style={{
              ...buttonBaseStyle,
              width: 67,
              backgroundPositionX: -136,
              backgroundPositionY: nextIsDisabled ? -15 : 0,
            }}
            disabled={nextIsDisabled} />
          <button
            onClick={goToLast}
            style={{
              ...buttonBaseStyle,
              width: 96,
              backgroundPositionX: -203,
              backgroundPositionY: nextIsDisabled ? -15 : 0,
              marginLeft: 24,
            }}
            disabled={nextIsDisabled} />
        </div>
      </nav>
      <div style={{
        border: '4px solid #343838',
        boxShadow: '6px 6px 0px #937500',
        boxSizing: 'border-box',
        fontSize: 0,
        position: 'relative',
        background: '#fff',
        paddingBottom: '49.326%',
      }}>
        {comics
          ? (
            comics.items.map((comic, i) => (
              <Transition
                key={i}
                in={currentIndex === i}
                timeout={transitionDuration}
                mountOnEnter
                unmountOnExit>
                {(state) => (
                  <img
                    alt={comic.fields.title}
                    title={comic.fields.title}
                    style={{
                      maxWidth: '100%',
                      transition: `opacity ${transitionDuration}ms ease-out`,
                      opacity: {
                        entering: 0,
                        entered: 1,
                        exiting: 0,
                        exited: 0,
                      }[state],
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                    src={comic.fields.image.fields.file.url} />
                )}
              </Transition>
            ))
          )
          : (
            <img
              alt="loading"
              src={spinnerUrl}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                tranform: 'translate(-50%, -50%)'
              }} />
          )
        }
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 8,
        }}>
        <a
          href="http://johnkeppel.com/"
          rel="noopener noreferrer"
          target="_blank">
          <img src={createdByUrl} alt="Created by John Keppel" />
        </a>
        {comics && (
          <div>
            {lastSeenIndex < comics.total - 1 && (
              <img src={newUrl} alt="New!" style={{ marginRight: 8 }} />
            )}
            <span>{currentIndex + 1}/{comics.total}</span>
          </div>
        )}
      </div>
    </div>
  );

  function goToFirst() {
    goToIndex(0);
  }

  function goToPrevious() {
    if (!previousIsDisabled) {
      goToIndex(currentIndex - 1);
    }
  }

  function goToNext() {
    if (!nextIsDisabled) {
      goToIndex(currentIndex + 1);
    }
  }

  function goToLast() {
    goToIndex(comics.total - 1);
  }

  function goToIndex(index) {
    window.location.hash = `#/${index + 1}`;
  }

  function getIndexFromHash(hash) {
    return parseInt(hash.replace('#/', '') - 1);
  }
};

export default App;
