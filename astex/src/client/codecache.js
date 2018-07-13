
import localforage from 'localforage';

localforage.getItem()
.then(lookup => {
    this.lookup = lookup;
});