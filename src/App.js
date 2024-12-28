// Dependencies
import React, { useEffect, useRef, useState } from "react";
import { animated, easings, useSpring } from "react-spring";
import "./tailwind.output.css";

const Pill = ({ title, onPillClick, selected, setRef, left }) => {
  const [styles, api] = useSpring(() => ({
    left: left,
    borderColor: selected ? "rgba(10,102,194,1)" : "rgba(114,114,114,0.8)",
    color: selected ? "rgba(10,102,194,1)" : "rgba(114,114,114,1)",
  }));
  useEffect(() => {
    api.start({
      left: left,
      config: { easing: easings.easeOutElastic, duration: 300 },
    });
  }, [left, api]);

  useEffect(() => {
    api.start({
      borderColor: selected ? "rgba(10,102,194,1)" : "rgba(114,114,114,0.8)",
      color: selected ? "rgba(10,102,194,1)" : "rgba(114,114,114,1)",
      config: { easing: easings.easeOutCubic },
    });
  }, [selected, api]);

  return (
    <animated.div
      ref={setRef}
      onClick={onPillClick}
      style={{ ...styles }}
      className="
      rounded-lg border-t-2 border-r-2 border-b-2 border-l-2
      text-m select-none cursor-pointer 
      absolute  
      bg-white 
       w-fit 
      p-1 px-2  
      "
    >
      {title}
    </animated.div>
  );
};

const SPACING_BETWEEN_PILLS = 12;
const SPACING_OFFSET = 2;
const App = () => {
  const [pills, setPills] = useState([
    {
      title: "adventure",
      left: 0,
      selected: false,
    },
    {
      title: "horror",
      left: 0,
      selected: false,
    },
    {
      title: "comedy",
      left: 0,
      selected: false,
    },
    {
      title: "action",
      left: 0,
      selected: false,
    },
    {
      title: "podcast",
      left: 0,
      selected: false,
    },
    {
      title: "period",
      left: 0,
      selected: false,
    },
  ]);
  const pillRefs = useRef([]);

  useEffect(() => {
    pillRefs.current = pillRefs.current.slice(0, pills.length);
  }, [pills.length]);
  useEffect(() => {
    let accumWidth = 0;
    for (let index = 1; index < pillRefs.current.length; index++) {
      if (pillRefs.current[index]) {
        accumWidth += pillRefs.current[index - 1].offsetWidth;
        const _filters = [...pills];
        _filters[index].left = accumWidth + index * SPACING_BETWEEN_PILLS;
        setPills(_filters);
      }
    }
  }, []);

  const onPillClick = (index) => (e) => {
    const _pills = [...pills];
    const isFirst = index === 0;
    const islast = index === _pills.length - 1;

    // if [nextPillIsSelected is true or prevPillIsSelected is true]
    // then the pill was or will be part of a selected group
    const nextPillIsSelected = !islast && _pills[index + 1].selected;
    const prevPillIsSelected = !isFirst && _pills[index - 1].selected;

    //[STEP I] hanlde pills positions
    // we want to create a chain/rope like effect
    // whereby when we move a certain pill
    // the following ones follow it to the appropriate postion
    if (!_pills[index].selected) {
      //pill is about to be selected

      if (nextPillIsSelected) {
        for (let i = index + 1; i < pillRefs.current.length; i++) {
          if (pillRefs.current[i]) {
            _pills[i].left -= SPACING_BETWEEN_PILLS + SPACING_OFFSET;
          }
        }
      }
      if (prevPillIsSelected) {
        for (let i = index; i < pillRefs.current.length; i++) {
          if (pillRefs.current[i]) {
            _pills[i].left -= SPACING_BETWEEN_PILLS + SPACING_OFFSET;
          }
        }
      }
    } else {
      // the pill is about to be unselected
      if (nextPillIsSelected) {
        for (let i = index + 1; i < pillRefs.current.length; i++) {
          if (pillRefs.current[i]) {
            _pills[i].left += SPACING_BETWEEN_PILLS + SPACING_OFFSET;
          }
        }
      }
      if (prevPillIsSelected) {
        for (let i = index; i < pillRefs.current.length; i++) {
          if (pillRefs.current[i]) {
            _pills[i].left += SPACING_BETWEEN_PILLS + SPACING_OFFSET;
          }
        }
      }
    }

    _pills[index].selected = !_pills[index].selected;

    //[STEP II] hanlde border radius and border width
    setBorderRadius(_pills);

    setPills(_pills);
  };

  const setBorderRadius = (_pills) => {
    // this function handles rounding corners accordignly
    // so if an elemnt from a selected group is
    // [Right most element] only round(top-righ && bottom-right)
    // [left most element] only round(top-left && bottom-left)
    // [for elemnts in the middle] don't apply in rounding of corners

    //[STEP 1 ] is to create a 2D array of selected pillsRefs group
    // example [[pillDomRef,pillDomRef][pillDomRef,pillDomRef...]...]
    let selectedPillsGroups = []; //this will hold groups of selected element refs
    let selectedLonePills = [];
    let unselectedPillsRefs = [];
    //group by selected
    const pillsLength = _pills.length;
    let currentSelectedGroupIndex = 0;
    for (let i = 0; i < pillsLength; i++) {
      const pill = _pills[i];

      const previousPillIsSelected = i > 0 && _pills[i - 1].selected;
      const nextPillIsSelected = i < pillsLength - 1 && _pills[i + 1].selected;
      if (pill.selected && (previousPillIsSelected || nextPillIsSelected)) {
        if (selectedPillsGroups.length) {
          // checking if we are still on the same group of pills
          console.log({ currentSelectedGroupIndex });
          console.log(selectedPillsGroups.length);
          const isNewSelectedPillsGroup =
            currentSelectedGroupIndex !== selectedPillsGroups.length - 1;
          if (isNewSelectedPillsGroup)
            selectedPillsGroups.push([pillRefs.current[i]]);
          else
            selectedPillsGroups[currentSelectedGroupIndex].push(
              pillRefs.current[i]
            );
        } else selectedPillsGroups.push([pillRefs.current[i]]);
      }

      //Im making a redudant if statment to make things readable :c
      if (pill.selected && !previousPillIsSelected && !nextPillIsSelected) {
        selectedLonePills.push(pillRefs.current[i]);
      }

      if (!pill.selected) {
        // only increment groupIndex if we have moved from a selected
        // pills group to an unselected pill
        if (selectedPillsGroups.length) currentSelectedGroupIndex++;

        unselectedPillsRefs.push(pillRefs.current[i]);
      }
    }

    //[STEP 2] add the appropriate border-radius and broder-width classes
    for (let i = 0; i < selectedPillsGroups.length; i++) {
      const selectedGroup = selectedPillsGroups[i];
      const selectedGroupLength = selectedGroup.length;

      for (let j = 0; j < selectedGroupLength; j++) {
        const pillRef = selectedGroup[j];
        pillRef.classList.remove("rounded-lg");
        pillRef.classList.remove("rounded-l-lg");
        pillRef.classList.remove("rounded-r-lg");

        if (j === 0) {
          // left moset pill
          pillRef.classList.add("border-l-2");
          pillRef.classList.remove("border-r-2");
          pillRef.classList.add("rounded-l-lg");
        } else if (j === selectedGroupLength - 1) {
          // right most pill
          pillRef.classList.add("border-r-2");
          pillRef.classList.remove("border-l-2");
          pillRef.classList.add("rounded-r-lg");
        } else {
          pillRef.classList.remove("border-l-2");
          pillRef.classList.remove("border-r-2");
        }
      }
    }

    //[STEP 3] re assign full border radius and border width of 2 to unselected pills
    for (let i = 0; i < unselectedPillsRefs.length; i++) {
      const itemClassList = unselectedPillsRefs[i].classList;
      if (!itemClassList.contains("rounded-lg"))
        itemClassList.add("rounded-lg");

      // add back full border (top bottom left right)
      if (!itemClassList.contains("border-l-2"))
        itemClassList.add("border-l-2");
      if (!itemClassList.contains("border-r-2"))
        itemClassList.add("border-r-2");
    }
    //[STEP 4] handle lone still selected pills that were part of a group
    for (let i = 0; i < selectedLonePills.length; i++) {
      const itemClassList = selectedLonePills[i].classList;
      itemClassList.add("rounded-lg");

      // add back full border (top bottom left right)
      if (!itemClassList.contains("border-l-2"))
        itemClassList.add("border-l-2");
      if (!itemClassList.contains("border-r-2"))
        itemClassList.add("border-r-2");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <h2 className="text-center text-4xl font-bold text-blue-500">
        Adjoined filters
      </h2>
      <div className=" p-2 ">
        <div className=" relative h-28 w-full bg-blue ">
          {pills.map(({ title, left, selected }, index) => (
            <Pill
              {...{
                selected,
                title,
                left,
                key: index,
                onPillClick: onPillClick(index),
                setRef: (el) => (pillRefs.current[index] = el),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
