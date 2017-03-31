// taken from tandem

const createInsertMutation = (index, value) => {
  return {
    value, 
    index,
    accept(visitor) {
      visitor.visitInsert(this);
    }
  }
};

const createRemoveMutation = (value, index) => {
  return {
    value,
    index,
    accept(visitor) {
      visitor.visitRemove(this);
    }
  };
};

const createUpdateMutation = (originalOldIndex, patchedOldIndex, newValue, index) => {
  return {
    originalOldIndex,
    patchedOldIndex,
    newValue,
    index,
    accept(visitor) {
      visitor.visitUpdate(this);
    }
  };
};

const createArrayMutations = (mutations) => {
  return {
    accept(visitor) {
      for (const mutation of mutations) {
        mutation.accept(visitor);
      }
    }
  }
}

 exports.diffArray = (oldArray, newArray, countDiffs) => {

  // model used to figure out the proper mutation indices
  const model    = [].concat(oldArray);

  // remaining old values to be matched with new values. Remainders get deleted.
  const oldPool  = [].concat(oldArray);

  // remaining new values. Remainders get inserted.
  const newPool  = [].concat(newArray);

  const mutations = [];
  let   matches   = [];

  for (let i = 0, n = oldPool.length; i < n; i++) {

    const oldValue = oldPool[i];
    let bestNewValue;

    let fewestDiffCount = Infinity;

    // there may be multiple matches, so look for the best one
    for (let j = 0, n2 = newPool.length; j < n2; j++) {

      const newValue   = newPool[j];

      // -1 = no match, 0 = no change, > 0 = num diffs
      let diffCount = countDiffs(oldValue, newValue);

      if (~diffCount && diffCount < fewestDiffCount) {
        bestNewValue    = newValue;
        fewestDiffCount = diffCount;
      }

      // 0 = exact match, so break here.
      if (fewestDiffCount === 0) break;
    }

    // subtract matches from both old & new pools and store
    // them for later use
    if (bestNewValue != null) {
      oldPool.splice(i--, 1);
      n--;
      newPool.splice(newPool.indexOf(bestNewValue), 1);

      // need to manually set array indice here to ensure that the order
      // of operations is correct when mutating the target array.
      matches[newArray.indexOf(bestNewValue)] = [oldValue, bestNewValue];
    }
  }

  for (let i = oldPool.length; i--;) {
    const oldValue  = oldPool[i];
    const index     = oldArray.indexOf(oldValue);
    mutations.push(createRemoveMutation(oldValue, index));
    model.splice(index, 1);
  }

  // sneak the inserts into the matches so that they're
  // ordered propertly along with the updates - particularly moves.
  for (let i = 0, n = newPool.length; i < n; i++) {
    const newValue = newPool[i];
    const index    = newArray.indexOf(newValue);
    matches[index] = [undefined, newValue];
  }

  // apply updates last using indicies from the old array model. This ensures
  // that mutations are properly applied to whatever target array.
  for (let i = 0, n = matches.length; i < n; i++) {
    const match = matches[i];

    // there will be empty values since we're manually setting indices on the array above
    if (match == null) continue;

    const [oldValue, newValue] = matches[i];
    const newIndex = i;

    // insert
    if (oldValue == null) {
      mutations.push(createInsertMutation(newIndex, newValue));
      model.splice(newIndex, 0, newValue);
    // updated
    } else {
      const oldIndex = model.indexOf(oldValue);
      mutations.push(createUpdateMutation(oldArray.indexOf(oldValue), oldIndex, newValue, newIndex));
      if (oldIndex !== newIndex) {
        model.splice(oldIndex, 1);
        model.splice(newIndex, 0, oldValue);
      }
    }
  }

  return createArrayMutations(mutations);
}